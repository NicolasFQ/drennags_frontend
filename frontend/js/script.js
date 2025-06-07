document.addEventListener('DOMContentLoaded', function() {
    // Sidebar hover functionality
    const sidebar = document.querySelector('.sidebar');
    const layoutContainer = document.querySelector('.layout-container');
    
    if (sidebar) {
        // Expand sidebar on hover
        sidebar.addEventListener('mouseenter', function() {
            layoutContainer.classList.add('sidebar-expanded');
        });
        
        // Collapse sidebar when mouse leaves
        sidebar.addEventListener('mouseleave', function() {
            layoutContainer.classList.remove('sidebar-expanded');
        });
    }
    
    // Form validation
    const volunteerForm = document.getElementById('volunteer-form');
    
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const location = document.getElementById('location').value;
            const helpType = document.getElementById('help_type').value;
            
            // Simple validation
            if (!name || !email || !phone || !location || !helpType) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um endereço de e-mail válido.');
                return;
            }
            
            // Phone validation
            const phoneRegex = /^[0-9]{10,11}$/;
            const cleanPhone = phone.replace(/\D/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                alert('Por favor, insira um número de telefone válido (10 ou 11 dígitos).');
                return;
            }
            
            // If validation passes, send data to server
            sendFormData({
                name,
                email,
                phone: cleanPhone,
                location,
                helpType
            });
        });
    }
    
    // Function to send form data to server
    function sendFormData(formData) {
        // In a real application, this would be an AJAX request to the server
        console.log('Sending form data:', formData);
        
        // Simulate server response
        setTimeout(() => {
            alert('Obrigado por se inscrever! Entraremos em contato em breve.');
            if (volunteerForm) {
                volunteerForm.reset();
            }
        }, 1000);
    }
    
    // Mobile navigation handling
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Add active class to clicked link and remove from others
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // For mobile, toggle sidebar expansion on click
        sidebar.addEventListener('click', function(e) {
            if (e.target === sidebar || e.target.closest('.profile')) {
                sidebar.classList.toggle('expanded');
            }
        });
    }
    
    // Video player functionality
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function() {
            // In a real application, this would load and play a video
            const videoContainer = document.querySelector('.video-container');
            
            // Replace placeholder with actual video element
            videoContainer.innerHTML = `
                <video controls width="100%" height="300">
                    <source src="videos/volunteers-testimonial.mp4" type="video/mp4">
                    Seu navegador não suporta vídeos HTML5.
                </video>
            `;
            
            // In this demo, we'll just show an alert
            alert('Em uma aplicação real, o vídeo seria carregado aqui.');
        });
    }
});