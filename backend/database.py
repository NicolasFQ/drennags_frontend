import sqlite3
from datetime import datetime

# Database file path
DB_FILE = "people.db"

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = sqlite3.connect(DB_FILE)
        connection.row_factory = sqlite3.Row
        return connection
    except sqlite3.Error as error:
        print(f"Error connecting to SQLite database: {error}")
        return None

def create_people_table():
    """Create the people table if it doesn't exist"""
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS people (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    birth_date DATE,
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    email TEXT,
                    phone TEXT
                )
            """)
            connection.commit()
            print("People table created successfully")
        except sqlite3.Error as error:
            print(f"Error creating table: {error}")
        finally:
            cursor.close()
            connection.close()

def insert_sample_data():
    sample_people = [
        {
            'name': 'Maria Silva',
            'birth_date': '1985-05-15',
            'email': 'maria.silva@email.com',
            'phone': '(11) 98765-4321'
        },
        {
            'name': 'João Santos',
            'birth_date': '1990-08-22',
            'email': 'joao.santos@email.com',
            'phone': '(11) 91234-5678'
        },
        {
            'name': 'Ana Oliveira',
            'birth_date': '1988-03-10',
            'email': 'ana.oliveira@email.com',
            'phone': '(11) 99876-5432'
        },
        {
            'name': 'Pedro Costa',
            'birth_date': '1992-11-30',
            'email': 'pedro.costa@email.com',
            'phone': '(11) 97777-8888'
        },
        {
            'name': 'Carla Mendes',
            'birth_date': '1995-07-18',
            'email': 'carla.mendes@email.com',
            'phone': '(11) 96666-7777'
        }
    ]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute('DELETE FROM people')
    
    # Insert sample data
    for person in sample_people:
        cursor.execute('''
            INSERT INTO people (name, birth_date, registration_date, email, phone)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            person['name'],
            person['birth_date'],
            datetime.now().strftime('%Y-%m-%d'),
            person['email'],
            person['phone']
        ))
    
    conn.commit()
    conn.close()

def insert_person(name, birth_date, email=None, phone=None):
    """Insert a new person into the database"""
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO people (name, birth_date, email, phone)
                VALUES (?, ?, ?, ?)
            """, (name, birth_date, email, phone))
            connection.commit()
            print("Person inserted successfully")
        except sqlite3.Error as error:
            print(f"Error inserting person: {error}")
        finally:
            cursor.close()
            connection.close()

def get_all_people():
    """Retrieve all people from the database"""
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, name, birth_date, registration_date, email, phone
                FROM people
                ORDER BY name
            """)
            people = []
            for row in cursor:
                people.append({
                    'id': row['id'],
                    'name': row['name'],
                    'birth_date': row['birth_date'],
                    'registration_date': row['registration_date'],
                    'email': row['email'],
                    'phone': row['phone']
                })
            return people
        except sqlite3.Error as error:
            print(f"Error retrieving people: {error}")
            return []
        finally:
            cursor.close()
            connection.close()
    return []

# Initialize the database and create table when the module is imported
if __name__ == "__main__":
    create_people_table()
    insert_sample_data() 