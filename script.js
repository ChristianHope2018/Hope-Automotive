// Function to get car list from localStorage or set an empty array if not available
function getCarList() {
    const storedCars = localStorage.getItem('carList');
    return storedCars ? JSON.parse(storedCars) : [];
}

// Function to save car list to localStorage
function saveCarList(carList) {
    localStorage.setItem('carList', JSON.stringify(carList));
}

// Function to validate login credentials
function validateLogin(username, password) {
    // Hardcoded username and password (this could be stored in a database in a real system)
    const correctUsername = "admin";
    const correctPassword = "password123"; // Don't store passwords in plaintext in production!

    return username === correctUsername && password === correctPassword;
}

// Function to handle login
document.getElementById("login-form")?.addEventListener("submit", function(event) {
    event.preventDefault();

    // Get the username and password input values
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Validate credentials
    if (validateLogin(username, password)) {
        // Set a logged-in flag in localStorage
        localStorage.setItem("isAdminLoggedIn", "true");

        // Redirect to admin page
        window.location.href = "admin.html";
    } else {
        // Show error message if credentials are incorrect
        document.getElementById("error-message").style.display = "block";
    }
});

    // Admin logout functionality
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            // Remove the logged-in flag from localStorage
            localStorage.removeItem("isAdminLoggedIn");
            alert("You have logged out.");
            window.location.href = "index.html"; // Redirect to login page
        });
    }

    // Add/edit car functionality
    const carForm = document.getElementById("car-form");
    if (carForm) {
        carForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const carId = document.getElementById("car-id").value;
            const carData = new FormData(carForm);

            const newCar = {
                id: carId ? parseInt(carId) : getCarList().length + 1, // New car if no ID
                year: carData.get("year"),
                name: carData.get("name"),
                color: carData.get("color"),
                interiorColor: carData.get("interior-color"),
                interiorType: carData.get("interior-type"),
                odometer: carData.get("odometer"),
                price: carData.get("price"),
                vin: carData.get("vin"),
                images: carData.getAll("car-images"),
                videos: carData.getAll("car-videos"),
                licenseExpiration: carData.get("license-expiration"),
                insuranceExpiration: carData.get("insurance-expiration"),
                lastServiced: carData.get("last-serviced"),
                partsNeeded: carData.get("parts-needed"),
                problems: carData.get("problems"),
            };

            let carDatabase = getCarList();

            if (carId) {
                // Edit existing car
                const carIndex = carDatabase.findIndex(car => car.id === parseInt(carId));
                carDatabase[carIndex] = newCar; // Update the car
                alert("Car updated successfully!");
            } else {
                // Add new car
                carDatabase.push(newCar);
                alert("Car added successfully!");
            }

            // Save updated car list to localStorage
            saveCarList(carDatabase);

            // Redirect to Admin Dashboard after saving
            window.location.href = "admin.html";
        });
    }

    // Load the car list for admin page
    if (document.getElementById("car-list-admin")) {
        loadCarListAdmin();
    }

    // Load individual car details for edit
    const carId = new URLSearchParams(window.location.search).get("id");
    if (carId) {
        const car = getCarList().find(c => c.id == carId);
        if (car) {
            document.getElementById("car-id").value = car.id;
            document.getElementById("year").value = car.year;
            document.getElementById("name").value = car.name;
            document.getElementById("color").value = car.color;
            document.getElementById("interior-color").value = car.interiorColor;
            document.getElementById("interior-type").value = car.interiorType;
            document.getElementById("odometer").value = car.odometer;
            document.getElementById("price").value = car.price;
            document.getElementById("vin").value = car.vin;
            document.getElementById("license-expiration").value = car.licenseExpiration;
            document.getElementById("insurance-expiration").value = car.insuranceExpiration;
            document.getElementById("last-serviced").value = car.lastServiced;
            document.getElementById("parts-needed").value = car.partsNeeded;
            document.getElementById("problems").value = car.problems;
        }
    }
);

// Load cars for admin page
function loadCarListAdmin() {
    const carListContainer = document.getElementById("car-list-admin");
    const carDatabase = getCarList();
    carDatabase.forEach(car => {
        const carCard = document.createElement("div");
        carCard.classList.add("car-item");

        carCard.innerHTML = `
            <h3>${car.year} ${car.name}</h3>
            <p>Price: ${car.price}</p>
            <p>Odometer: ${car.odometer} miles</p>
            <a href="add_edit_car.html?id=${car.id}" class="button">Edit</a>
            <button class="button" onclick="deleteCar(${car.id})">Delete</button>
        `;
        carListContainer.appendChild(carCard);
    });
}

// Delete car
function deleteCar(carId) {
    const confirmDelete = confirm("Are you sure you want to delete this car?");
    if (confirmDelete) {
        let carDatabase = getCarList();
        carDatabase = carDatabase.filter(car => car.id !== carId);
        saveCarList(carDatabase);
        alert("Car deleted successfully!");
        window.location.reload();
    }
}

// Function to populate car details on public page
function loadCarDetails(carId) {
    const car = getCarList().find(c => c.id === carId);
    if (car) {
        const carDetailsContainer = document.getElementById("car-details");
        carDetailsContainer.innerHTML = `
            <h2>${car.year} ${car.name}</h2>
            <p><strong>Color:</strong> ${car.color}</p>
            <p><strong>Interior Color:</strong> ${car.interiorColor}</p>
            <p><strong>Interior Type:</strong> ${car.interiorType}</p>
            <p><strong>Odometer:</strong> ${car.odometer} miles</p>
            <p><strong>Asking Price:</strong> ${car.price}</p>
            <p><strong>VIN:</strong> ${car.vin}</p>
            <h3>Images:</h3>
            ${car.images.map(image => `<img src="${image}" alt="${car.name}" />`).join('')}
            <h3>Videos:</h3>
            ${car.videos.map(video => `<video controls><source src="${video}" type="video/mp4"></video>`).join('')}
        `;
    }
}
