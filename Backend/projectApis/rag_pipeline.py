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
        self.llm = ChatGroq(model_name="llama-3.1-8b-instant")
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
            Based on the following software requirements and design document excerpt, generate a list of specific development tasks.

            Requirements Context:
            {context}

            Guidelines for task generation:
            - Mention the requirement id from the context to each task associated with the requirement
            - Tasks should be concrete, actionable items
            - Focus on technical implementation tasks only
            - Exclude project management or administrative tasks
            - Each task should represent a distinct unit of work
            - Tasks should be aligned with software development best practices
            - Output must be generated according to the template described below:
                output_template = 
                json({{
                {{
                    task_id: <number>
                    task_title: <title here> - <srs-id>,
                    task_desc: <short 2 sentence description>
                }} ,
                {{
                    task_id: <number>
                    task_title: <title here> - <srs-id>,
                    task_desc: <short 2 sentence description>
                }}
                }}
                )
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
            Review the following list of development tasks and:
            1. Remove any duplicates
            2. Combine identical tasks
            3. Organize tasks in logical order
            4. Ensure all tasks are specific and actionable
            5. Ensure that the output is strictly following the template and no extra content is generated
                output_template = 
                json({{
                {{
                    task_id: <number>
                    task_title: <title here> - <srs-id>,
                    task_desc: <short 2 sentence description>
                }},
                {{
                    task_id: <number>
                    task_title: <title here> - <srs-id>,
                    task_desc: <short 2 sentence description>
                }}
                }}
                )
            Tasks:
            {tasks}
            Provide a final, cleaned list of development tasks:
            """
        )

        consolidation_chain = consolidated_prompt | self.llm
        final_tasks = consolidation_chain.invoke({"tasks": "\n".join(tasks_gen)})
        print("Tasks validated!")
        
        return final_tasks
