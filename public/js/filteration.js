// Tax Info Toggle
const taxSwitch = document.getElementById("flexSwitchCheckDefault");
if (taxSwitch) {
    taxSwitch.addEventListener("click", () => {
        const taxInfoElements = document.querySelectorAll(".tax-info");
        taxInfoElements.forEach(info => {
            info.style.display = info.style.display === "none" || !info.style.display ? "inline" : "none";
        });
    });
} else {
    console.error("Tax switch element not found.");
}

// Filter Functionality
document.querySelectorAll('.filter').forEach(filter => {
    filter.addEventListener('click', function () {
        document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
        this.classList.add('active');

        const selectedFilter = this.getAttribute('data-filter');
        console.log(`Selected filter: ${selectedFilter}`);

        fetch(`/listings?category=${selectedFilter}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
                const newContent = parsedHTML.querySelector('.row').innerHTML;

                document.querySelector('.row').innerHTML = newContent;
            })
            .catch(error => console.error('Error fetching filtered listings:', error));
    });
});