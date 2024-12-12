import os
from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()
os.environ['GROQ_API_KEY'] = os.getenv('GROQ_API_KEY') # For LLM -- llama-3.1-8b (small) & mixtral-8x7b-32768 (large)
os.environ['COHERE_API_KEY'] = os.getenv('COHERE_API_KEY')
# Initialize models and embeddings
llm = ChatGroq(
    model_name="llama-3.1-8b-instant"
)

embeddings = CohereEmbeddings(
    model="embed-english-v3.0"
)

def extract_tasks_from_requirements(pdf_path):
    # Load and split the PDF
    print("Loading Document...")
    start_time = time.time()
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    print("Document Loaded!")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time elapsed: {elapsed_time:.2f} seconds")
    

    print("Creating Chunks...")
    start_time = time.time()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=4000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(documents)
    
    # print(splits)
    # Create vector store
    vectorstore = FAISS.from_documents(splits, embeddings)
    print("Chunks created!")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time elapsed: {elapsed_time:.2f} seconds")

    start_time = time.time()
    print("Generating tasks list...")
    # Define task extraction prompt
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
    
    # Create task extraction chain
    task_chain = task_prompt | llm
    
    # Process each document chunk
    all_tasks = []
    for doc in splits:
        # print(doc.page_content, "page = ", doc.metadata['page'], sep="\t")
        # print('\n')
        tasks = task_chain.invoke({"context" :doc.page_content})
        all_tasks.append(tasks)
    
    tasks_gen = []
    for task in all_tasks:
        task = task.content
        tasks_gen.append(task)
    print("Tasks generated!")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time elapsed: {elapsed_time:.2f} seconds")

    start_time = time.time()
    print("Validating and checking tasks...")
    # Consolidate and deduplicate tasks
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
    
    consolidation_chain = consolidated_prompt | llm
    final_tasks = consolidation_chain.invoke({"tasks": "\n".join(tasks_gen)})
    print("Tasks validated!")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time elapsed: {elapsed_time:.2f} seconds")
    return final_tasks

if __name__ == "__main__":
    pdf_path = "data/ReqView-Example_Software_Requirements_Specification_SRS_Document.pdf"  # Replace with your PDF path
    start_time = time.time()
    development_tasks = extract_tasks_from_requirements(pdf_path)
    print("\nFinal Development Tasks:")
    print(development_tasks.content)
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Total time elapsed: {elapsed_time:.2f} seconds")
