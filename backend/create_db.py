import pyodbc

try:
    conn = pyodbc.connect('Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=master;Trusted_Connection=yes;', autocommit=True)
    cursor = conn.cursor()
    cursor.execute("IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'jrmsu_library') BEGIN CREATE DATABASE jrmsu_library; END")
    conn.close()
    print("SSMS Database jrmsu_library created successfully or already exists.")
except Exception as e:
    print("Error:", e)
