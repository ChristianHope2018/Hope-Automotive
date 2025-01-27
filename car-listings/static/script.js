// Handle form submissions for adding/editing cars
document.addEventListener("DOMContentLoaded", () => {
    const carForm = document.getElementById("car-form");
    const deleteButtons = document.querySelectorAll(".delete-car");
    const viewImageButtons = document.querySelectorAll(".view-images");

    if (carForm) {
        carForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(carForm);
            const data = Object.fromEntries(formData.entries());
            const carId = data.id; // Check if it's an edit operation

            const endpoint = carId
                ? `/admin/add-car?id=${carId}` // Update car
                : `/admin/add-car`; // Add new car

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("Car saved successfully!");
                window.location.href = "/admin";
            } else {
                alert("Failed to save car.");
            }
        });
    }

    // Handle delete car buttons
    deleteButtons.forEach((button) => {
        button.addEventListener("click", async (event) => {
            const carId = button.dataset.carId;

            if (confirm("Are you sure you want to delete this car?")) {
                const response = await fetch(`/admin/delete-car?id=${carId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Car deleted successfully!");
                    window.location.reload();
                } else {
                    alert("Failed to delete car.");
                }
            }
        });
    });

    // Handle view images buttons
    viewImageButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const carId = button.dataset.carId;
            window.location.href = `/car-images?id=${carId}`;
        });
    });

    // Fetch and render public car list
    const publicCarList = document.getElementById("car-list-public");
    if (publicCarList) {
        fetch("/api/cars")
            .then((response) => response.json())
            .then((cars) => {
                publicCarList.innerHTML = cars
                    .map(
                        (car) => `
                <div class="car-item">
                    <img src="${car.images[0] || "https://via.placeholder.com/300"}" alt="${car.name}" class="car-thumbnail">
                    <h3>${car.year} ${car.name}</h3>
                    <p><strong>Color:</strong> ${car.color}</p>
                    <p><strong>Odometer:</strong> ${car.odometer} miles</p>
                    <p><strong>Price:</strong> $${car.price}</p>
                    <a href="/car-details?id=${car.id}" class="button">View Details</a>
                </div>
            `
                    )
                    .join("");
            })
            .catch((error) => {
                console.error("Failed to load public car list:", error);
            });
    }

    // Render car details page
    const carDetailsContainer = document.getElementById("car-details-container");
    if (carDetailsContainer) {
        const carId = new URLSearchParams(window.location.search).get("id");

        fetch(`/api/car?id=${carId}`)
            .then((response) => response.json())
            .then((car) => {
                carDetailsContainer.innerHTML = `
                <h2>${car.year} ${car.name}</h2>
                <img src="${car.images[0] || "https://via.placeholder.com/300"}" alt="${car.name}" class="car-thumbnail">
                <p><strong>Color:</strong> ${car.color}</p>
                <p><strong>Interior Color:</strong> ${car.interiorColor}</p>
                <p><strong>Interior Type:</strong> ${car.interiorType}</p>
                <p><strong>Odometer:</strong> ${car.odometer} miles</p>
                <p><strong>Price:</strong> $${car.price}</p>
                <p><strong>VIN:</strong> ${car.vin}</p>
                <p><strong>License Expiration:</strong> ${car.licenseExpiration}</p>
                <p><strong>Insurance Expiration:</strong> ${car.insuranceExpiration}</p>
                <p><strong>Last Serviced:</strong> ${car.lastServiced}</p>
                <p><strong>Parts Needed:</strong> ${car.partsNeeded}</p>
                <p><strong>Problems:</strong> ${car.problems}</p>
                <button class="button view-images" data-car-id="${car.id}">View Images</button>
            `;
            })
            .catch((error) => {
                console.error("Failed to load car details:", error);
            });
    }
});
