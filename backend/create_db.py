import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()
db_name = os.environ.get("DB_NAME", "JRMSUKatipunanCampusLibrary")
user = os.environ.get("DB_USER", "sa")
pwd = os.environ.get("DB_PASSWORD", "")
win_auth = os.environ.get("DB_WINDOWS_AUTH", "True") == "True"
host = os.environ.get("DB_HOST", "localhost")

try:
    if win_auth:
        conn_str = f"Driver={{ODBC Driver 17 for SQL Server}};Server={host};Database=master;Trusted_Connection=yes;"
    else:
        conn_str = f"Driver={{ODBC Driver 17 for SQL Server}};Server={host};Database=master;UID={user};PWD={pwd};"
        
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()
    cursor.execute(f"IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '{db_name}') BEGIN CREATE DATABASE {db_name}; END")
    conn.close()
    print(f"SSMS Database {db_name} created successfully or already exists.")
except Exception as e:
    print("Error:", e)
