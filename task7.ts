// 1. Inställningar (Anpassad till din HTTPS-port från Visual Studio)
const API_URL = "https://localhost:5000/api/cars";

// 2. DOM-referenser
const loadBtn = document.querySelector("#load-btn") as HTMLButtonElement;
const carList = document.querySelector("#car-list") as HTMLDListElement;
const carForm = document.querySelector("#car-form");
const carIdInput = document.querySelector("#car-id");
const formTitle = document.querySelector("#form-title");
const submitBtn = document.querySelector("#submit-btn") as HTMLButtonElement;
const cancelBtn = document.querySelector("#cancel-btn") as HTMLButtonElement;

// ==========================================
// 🟢 READ (GET) - Hämta och visa alla bilar
// ==========================================

interface car {
    id?: number;
    brand: string;
    model: string;
    year: number;
    color: string;
}

const fetchCars = async () => {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error on response: ${response.status}`);
        }

        const cars: car[] = await response.json();

        // Töm listan innan vi ritar ut på nytt
        carList.innerHTML = "";

        if (cars.length === 0) {
            carList.innerHTML = "<p>There are no cars in the database.</p>";
            return;
        }

        // Loopa igenom bilarna och bygg HTML för varje kort
        for (const car of cars) {
            if (car.id === undefined) {
                continue; 
            }

            const card = document.createElement("div");
            card.className = "car-card";
            card.innerHTML = `
        <div>
            <strong>${car.brand} ${car.model}</strong> (${car.year}) <br>
            <span style="font-size: 0.9rem; color: #777;">Färg: ${car.color}</span>
        </div>
        <div class="btn-group">
            <button data-buttontype="update" class="outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Redigera</button>
            <button data-buttontype="delete" class="outline contrast" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Ta bort</button>
        </div>
    `;

            card.addEventListener("click", (e) => {
                const target = e.target as HTMLElement;
                const targetDataType = target.dataset.buttontype;

                if (targetDataType === "delete" && car.id !== undefined) {
                    deleteCar(car.id);
                }
            });

            carList.appendChild(card);
        }
    } catch (error) {
        console.error("Error:", error);
        carList.innerHTML = `<p style="color: red;">Can't get cars. Is API on ${API_URL}?</p>`;
    }
};

// ==========================================
// 🟢 ADD (Post) - Add a car
// ==========================================
async function saveCarFromForm() {
    console.log("Saving car");
    const yearInput = document.getElementById("year") as HTMLFormElement | null;
    const brandInput = document.getElementById("brand") as HTMLInputElement | null;
    const modelInput = document.getElementById("model") as HTMLInputElement | null;
    const colorInput = document.getElementById("color") as HTMLInputElement | null;


    if (!yearInput || !brandInput || !modelInput || !colorInput) {
        console.error("One or more form elements are missing");
        return;
    }

    const newCar: car = {
        brand: brandInput.value,
        model: modelInput.value,
        year: parseInt(yearInput.value),
        color: colorInput.value,
    };

    if (!newCar.brand || !newCar.model || isNaN(newCar.year) || !newCar.color) {
        console.error("Invalid car data:", newCar);
        return;
    }

    await addCar(newCar);
}

const addCar = async (newCar: car) => {
    console.log("Adding car: ", newCar);
    try {
        console.log("Sending:", newCar);
        if (currentEdtingCar != undefined && currentEditingId != undefined) {
            const response = await fetch(`${API_URL}/${currentEditingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newCar, id: currentEditingId }),
            });
            console.log("Response status:", response);
            console.log("Response text:", await response.text());
        } else {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCar),
            });
            console.log("Response status:", response);
            console.log("Response text:", await response.text());
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

// ==========================================
// 🟢 DELETE (Delete) - Remove a car
// ==========================================
const deleteCar = async (id: number) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`Failed to delete car: ${response.status}`);
        }
        console.log("Removed car:", id);
        await fetchCars(); // Wait for fetchCars to complete
    } catch (error) {
        console.error("Error deleting car:", error);
    }
};
// ==========================================
// 🟢 EDIT (Patch) - Edit a car
// ==========================================
let currentEdtingCar: car;
let currentEditingId: number;
const getCar = async (id: number) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {});
        const car = await response.json();
        console.log("Got car:", car);
        currentEdtingCar = car;
        currentEditingId = id;
        prepareEdit(currentEdtingCar);
    } catch (error) {
        console.error("Error deleting car:", error);
    }
};

const prepareEdit = (car: car) => {
    if (car.id === undefined) {
        console.log("Car has no id", car);
        return;
    }

    currentEditingId = car.id;

    const brandInput = document.getElementById("brand") as HTMLInputElement | null;
    const modelInput = document.getElementById("model") as HTMLInputElement | null;
    const yearInput = document.getElementById("year") as HTMLInputElement | null;
    const colorInput = document.getElementById("color") as HTMLInputElement | null;
    const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement | null;

    if (!brandInput || !modelInput || !yearInput || !colorInput || !submitBtn) {
        console.error("One or more form elements are missing");
        return;
    }

    brandInput.value = car.brand;
    modelInput.value = car.model;
    yearInput.value = car.year.toString(); // Ensure year is a string for input value
    colorInput.value = car.color;
    submitBtn.textContent = "Update Car";

    brandInput.focus();
};

// Event listener för ladda-knappen
loadBtn.addEventListener("click", fetchCars);
submitBtn.addEventListener("click", saveCarFromForm);

// fetchCars();