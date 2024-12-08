(() => {
    'use strict'

    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

// Password Visibility
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const icon = this.querySelector('i');

    // Toggle the password visibility
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
});

// Total Taxes function
let taxSwitch = document.getElementById("flexSwitchCheckDefault")
    taxSwitch.addEventListener("click", () => {
        let taxInfo = document.getElementsByClassName("tax-info")
        for(info of taxInfo){
            if(info.style.display != "inline"){
                info.style.display = "inline"
            } else {
                info.style.display = "none"
            }
        }
    })

// Filteration
document.querySelectorAll('.filter').forEach(filter => {
    filter.addEventListener('click', function () {
        document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));

        this.classList.add('active');

        const selectedFilter = this.getAttribute('data-filter');

        fetch(`/listings?category=${selectedFilter}`)
            .then(response => response.text())
            .then(html => {
                document.querySelector('.row').innerHTML = new DOMParser()
                    .parseFromString(html, 'text/html')
                    .querySelector('.row').innerHTML;
            })
            .catch(error => console.error('Error fetching filtered listings:', error));
    });
});
