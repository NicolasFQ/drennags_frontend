class ConsultationManager {
    constructor() {
        this.apiUrl = 'http://localhost:8000';
        this.consultations = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConsultations();
    }

    bindEvents() {
        // Modal events
        document.getElementById('btnNewConsultation').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('modalBackBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('btnCancel').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                this.closeModal();
            }
        });

        // Edit modal events
        document.getElementById('editModalBackBtn').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('editBtnCancel').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('editModalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModalOverlay')) {
                this.closeEditModal();
            }
        });

        // Form submissions
        document.getElementById('consultationForm').addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        document.getElementById('editConsultationForm').addEventListener('submit', (e) => {
            this.handleEditFormSubmit(e);
        });

        // Input formatting
        this.setupInputFormatting();
    }

    setupInputFormatting() {
        // CPF formatting
        const cpfInputs = document.querySelectorAll('#cpf, #editCpf');
        cpfInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        });

        // CEP formatting
        const cepInputs = document.querySelectorAll('#cep, #editCep');
        cepInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            });
        });

        // Phone formatting
        const phoneInputs = document.querySelectorAll('#phone, #editPhone');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            });
        });
    }

    openModal() {
        document.getElementById('modalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('consultationForm').reset();
    }

    openEditModal(consultation) {
        document.getElementById('editConsultationId').value = consultation.id;
        document.getElementById('editFullName').value = consultation.full_name;
        document.getElementById('editCpf').value = consultation.cpf;
        document.getElementById('editConsultationType').value = consultation.consultation_type;
        document.getElementById('editCep').value = consultation.cep;
        document.getElementById('editPhone').value = consultation.phone;
        
        document.getElementById('editModalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
        document.getElementById('editModalOverlay').classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('editConsultationForm').reset();
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const consultationData = {
            full_name: formData.get('fullName'),
            cpf: formData.get('cpf'),
            consultation_type: formData.get('consultationType'),
            cep: formData.get('cep'),
            phone: formData.get('phone')
        };

        try {
            const response = await fetch(`${this.apiUrl}/consultations/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(consultationData)
            });

            if (response.ok) {
                this.closeModal();
                this.loadConsultations();
                this.showNotification('Consulta criada com sucesso!', 'success');
            } else {
                throw new Error('Erro ao criar consulta');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Erro ao criar consulta', 'error');
        }
    }

    async handleEditFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const consultationId = formData.get('consultationId');
        const consultationData = {
            full_name: formData.get('fullName'),
            cpf: formData.get('cpf'),
            consultation_type: formData.get('consultationType'),
            cep: formData.get('cep'),
            phone: formData.get('phone')
        };

        try {
            const response = await fetch(`${this.apiUrl}/consultations/${consultationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(consultationData)
            });

            if (response.ok) {
                this.closeEditModal();
                this.loadConsultations();
                this.showNotification('Consulta atualizada com sucesso!', 'success');
            } else {
                throw new Error('Erro ao atualizar consulta');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Erro ao atualizar consulta', 'error');
        }
    }

    async loadConsultations() {
        try {
            const response = await fetch(`${this.apiUrl}/consultations/`);
            if (response.ok) {
                this.consultations = await response.json();
                this.renderConsultations();
            } else {
                throw new Error('Erro ao carregar consultas');
            }
        } catch (error) {
            console.error('Error loading consultations:', error);
            this.renderEmptyState();
        }
    }

    async deleteConsultation(id) {
        if (!confirm('Tem certeza que deseja deletar esta consulta?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/consultations/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.loadConsultations();
                this.showNotification('Consulta deletada com sucesso!', 'success');
            } else {
                throw new Error('Erro ao deletar consulta');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Erro ao deletar consulta', 'error');
        }
    }

    renderConsultations() {
        const container = document.getElementById('consultationsList');
        
        if (this.consultations.length === 0) {
            this.renderEmptyState();
            return;
        }

        container.innerHTML = this.consultations.map(consultation => {
            const statusClass = `status-${consultation.status.toLowerCase()}`;
            const statusIcon = this.getStatusIcon(consultation.status);
            
            // Only show delete button for cancelled consultations
            const deleteButton = consultation.status === 'Cancelado' ? 
                `<button class="btn-action btn-delete" onclick="consultationManager.deleteConsultation(${consultation.id})">
                    Deletar
                </button>` : '';
            
            return `
                <div class="consultation-card">
                    <div class="consultation-header">
                        <div class="patient-info">
                            <div class="info-usuario">
                                <h3>${consultation.full_name}</h3> <h4>CPF: ${consultation.cpf}</h4>
                            </div>    
                            <div class="specialty">${consultation.consultation_type}</div>
                            <div class="consultation-details">
                                Solicitação feita em: ${this.formatDate(consultation.created_at)} às ${this.formatTime(consultation.created_at)}
                            </div>
                            <div class="consultation-location">
                                Telefone: ${consultation.phone} | CEP: ${consultation.cep}
                            </div>
                        </div>
                        <div class="status-badge ${statusClass}">
                            Situação: ${consultation.status} ${statusIcon}
                        </div>
                    </div>
                    
                    <div class="consultation-actions">
                        ${consultation.status !== 'Cancelado' && consultation.status !== 'Finalizado' ? 
                            `<button class="btn-action btn-cancel-consultation" onclick="consultationManager.cancelConsultation(${consultation.id})">
                                Cancelar consulta
                            </button>` : ''
                        }
                        <button class="btn-action btn-edit" onclick="consultationManager.editConsultation(${consultation.id})">
                            Editar
                        </button>
                        ${deleteButton}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderEmptyState() {
        const container = document.getElementById('consultationsList');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>Nenhuma consulta encontrada.</p>
                <p>Clique em "Nova Consulta" para agendar sua primeira consulta.</p>
            </div>
        `;
    }

    editConsultation(id) {
        const consultation = this.consultations.find(c => c.id === id);
        if (consultation) {
            this.openEditModal(consultation);
        }
    }

    // New method for cancellation that doesn't interact with the database
    cancelConsultation(id) {
        if (!confirm('Tem certeza que deseja cancelar esta consulta?')) {
            return;
        }

        // Find the consultation in the local array and update its status
        const consultationIndex = this.consultations.findIndex(c => c.id === id);
        if (consultationIndex !== -1) {
            // Update the status locally without database interaction
            this.consultations[consultationIndex].status = 'Cancelado';
            
            // Re-render the consultations list
            this.renderConsultations();
            this.showNotification('Consulta cancelada com sucesso!', 'success');
        }
    }

    // Keep this method for other status updates that do need to interact with the database
    async updateStatus(id, newStatus) {
        try {
            const response = await fetch(`${this.apiUrl}/consultations/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                this.loadConsultations();
                this.showNotification(`Status atualizado para ${newStatus}!`, 'success');
            } else {
                throw new Error('Erro ao atualizar status');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Erro ao atualizar status', 'error');
        }
    }

    getStatusIcon(status) {
        const icons = {
            'Aguardando': '⏰',
            'Confirmado': '👍',
            'Cancelado': '❌',
            'Finalizado': '✅'
        };
        return icons[status] || '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    showNotification(message, type) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application
const consultationManager = new ConsultationManager();

// Function to fetch and display people data
async function fetchAndDisplayPeople() {
    try {
        const response = await fetch('https://drennags-backend.onrender.com/people/');
        if (!response.ok) {
            throw new Error('Failed to fetch people data');
        }
        const people = await response.json();
        
        const peopleList = document.getElementById('peopleList');
        peopleList.innerHTML = '';

        if (people.length === 0) {
            peopleList.innerHTML = '<p class="empty-state">Nenhuma pessoa cadastrada ainda.</p>';
            return;
        }

        people.forEach(person => {
            const personCard = document.createElement('div');
            personCard.className = 'person-card';
            
            personCard.innerHTML = `
                <h3>${person.name}</h3>
                <div class="person-info">
                    ${person.birth_date ? `
                        <span>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                            </svg>
                            Nascimento: ${person.birth_date}
                        </span>
                    ` : ''}
                    ${person.email ? `
                        <span>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            ${person.email}
                        </span>
                    ` : ''}
                    ${person.phone ? `
                        <span>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            ${person.phone}
                        </span>
                    ` : ''}
                </div>
            `;
            
            peopleList.appendChild(personCard);
        });
    } catch (error) {
        console.error('Error fetching people data:', error);
        const peopleList = document.getElementById('peopleList');
        peopleList.innerHTML = '<p class="error-state">Erro ao carregar pessoas. Por favor, tente novamente.</p>';
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayPeople();
    consultationManager.init();
});