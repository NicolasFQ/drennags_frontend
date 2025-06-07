from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database import get_all_people, insert_person, create_people_table, insert_sample_data

app = FastAPI(title="Medical Consultation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConsultationBase(BaseModel):
    full_name: str
    cpf: str
    consultation_type: str
    cep: str
    phone: str

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationUpdate(ConsultationBase):
    pass

class ConsultationStatusUpdate(BaseModel):
    status: str

class Consultation(ConsultationBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

consultations: List[Consultation] = []
next_id = 1


def get_consultation_by_id(consultation_id: int) -> Consultation:
    for c in consultations:
        if c.id == consultation_id:
            return c
    return None


@app.get("/")
async def root():
    return {"message": "Medical Consultation API is running"}

@app.get("/consultations/", response_model=List[Consultation])
async def get_all_consultations():
    return sorted(consultations, key=lambda x: x.created_at, reverse=True)

@app.get("/consultations/{consultation_id}", response_model=Consultation)
async def get_consultation(consultation_id: int):
    consultation = get_consultation_by_id(consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    return consultation

@app.post("/consultations/", response_model=Consultation)
async def create_consultation(consultation_data: ConsultationCreate):
    global next_id
    now = datetime.now()
    new_consultation = Consultation(
        id=next_id,
        full_name=consultation_data.full_name,
        cpf=consultation_data.cpf,
        consultation_type=consultation_data.consultation_type,
        cep=consultation_data.cep,
        phone=consultation_data.phone,
        status="Aguardando",
        created_at=now,
        updated_at=now
    )
    consultations.append(new_consultation)
    next_id += 1
    return new_consultation

@app.put("/consultations/{consultation_id}", response_model=Consultation)
async def update_consultation(consultation_id: int, update_data: ConsultationUpdate):
    consultation = get_consultation_by_id(consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    consultation.full_name = update_data.full_name
    consultation.cpf = update_data.cpf
    consultation.consultation_type = update_data.consultation_type
    consultation.cep = update_data.cep
    consultation.phone = update_data.phone
    consultation.updated_at = datetime.now()
    return consultation

@app.patch("/consultations/{consultation_id}/status")
async def update_status(consultation_id: int, status_update: ConsultationStatusUpdate):
    consultation = get_consultation_by_id(consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")

    valid_statuses = ["Aguardando", "Confirmado", "Cancelado", "Finalizado"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Status Inválido")

    consultation.status = status_update.status
    consultation.updated_at = datetime.now()
    return {"message": "Status updated successfully"}

@app.delete("/consultations/{consultation_id}")
async def delete_consultation(consultation_id: int):
    global consultations
    consultation = get_consultation_by_id(consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    consultations = [c for c in consultations if c.id != consultation_id]
    return {"message": "Consultation deleted successfully"}

@app.get("/people/", response_model=List[dict])
async def get_people():
    """Get all people from the database"""
    return get_all_people()

@app.post("/people/")
async def create_person(name: str, birth_date: str, email: str = None, phone: str = None):
    """Create a new person in the database"""
    try:
        birth_date_obj = datetime.strptime(birth_date, '%Y-%m-%d').date()
        insert_person(name, birth_date_obj, email, phone)
        return {"message": "Person created successfully"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Initialize database with sample data
create_people_table()
insert_sample_data()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
