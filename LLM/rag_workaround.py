import os
from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
load_dotenv()

# Load environment variables
load_dotenv()
os.environ['GROQ_API_KEY'] = os.getenv('GROQ_API_KEY')
os.environ['COHERE_API_KEY'] = os.getenv('COHERE_API_KEY')

class TaskExtractor:
    def __init__(self, pdf_path):
        # Initialize models and embeddings
        self.llm = ChatGroq(model_name="llama-3.3-70b-versatile")
        self.embeddings = CohereEmbeddings(model="embed-english-v3.0")
        self.pdf_path = pdf_path

    def extract_tasks_from_requirements(self):
        # Load and split the PDF
        print("Loading Document...")
        loader = PyPDFLoader(self.pdf_path)
        documents = loader.load()
        print("Document Loaded!")

        # Create Chunks
        print("Creating Chunks...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=4000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        print("Chunks created!")

        # Create vector store
        vectorstore = FAISS.from_documents(splits, self.embeddings)

        # Generate tasks list
        print("Generating tasks list...")
        task_prompt = PromptTemplate(
        input_variables=["context"],
        template="""
        Based on the following requirements, generate a list of specific development tasks.

Requirements Context:
{context}

Guidelines:
- Include the requirement ID for each task.
- Focus on actionable, technical tasks only.
- Exclude non-technical or administrative tasks.
- Each task should be a distinct, concrete unit of work.
- Use JSON format strictly as shown below:

            output_template = 
            ```json
                {{
                    "tasks": [
                        {{
                            task_id: <number>
                            task_title: <title here> - <srs-id>,
                            task_desc: <short 2 sentence description>
                        }}
                    ]
                }}
                ```

        
        Generate a list of development tasks:
        """
    )
        
        task_chain = task_prompt | self.llm
        all_tasks = []
        for doc in splits:
            tasks = task_chain.invoke({"context": doc.page_content})
            all_tasks.append(tasks)

        tasks_gen = [task.content for task in all_tasks]
        print("Tasks generated!")

        # Validating and checking tasks
        print("Validating and checking tasks...")
        consolidated_prompt = PromptTemplate(
        input_variables=["tasks"],
        template="""
        Review the following tasks and:
1. Remove duplicates.
2. Combine identical tasks.
3. Organize tasks logically.
4. Ensure tasks are specific and actionable.
5. Provide the cleaned, validated list in the strict JSON format below:

            output_template = 
            ```json
    {{
        "tasks": [
            {{
                task_id: <number>
                task_title: <title here> - <srs-id>,
                task_desc: <short 2 sentence description>
            }}
        ]
    }}
    ```
        
        Tasks:
        {tasks}
        
        """
    )


        consolidation_chain = consolidated_prompt | self.llm
        final_tasks = consolidation_chain.invoke({"tasks": "\n".join(tasks_gen)})
        print("Tasks validated!")
        
        return final_tasks




if __name__ == "__main__":
    pdf_path = "ReqView-Example_Software_Requirements_Specification_SRS_Document.pdf"
    task_extractor = TaskExtractor(pdf_path)
    tasks = task_extractor.extract_tasks_from_requirements()
    print(tasks.content)