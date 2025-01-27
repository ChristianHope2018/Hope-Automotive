package main

import (
	"car-listings/db"
	"car-listings/models"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

var templates = template.Must(template.ParseGlob("templates/*.html"))

func main() {
	// Connect to Neon PostgreSQL
	if err := db.ConnectDB(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.CloseDB()

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/car-details", carDetailsHandler)
	http.HandleFunc("/car-images", carImagesHandler)
	http.HandleFunc("/admin", adminHandler)
	http.HandleFunc("/admin/add-car", addCarHandler)
	http.HandleFunc("/admin/delete-car", deleteCarHandler)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	cars, err := db.GetAllCars()
	if err != nil {
		http.Error(w, "Failed to load cars", http.StatusInternalServerError)
		return
	}
	templates.ExecuteTemplate(w, "index.html", cars)
}

func carDetailsHandler(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.URL.Query().Get("id"))
	car, err := db.GetCarByID(id)
	if err != nil {
		http.Error(w, "Failed to load car details", http.StatusInternalServerError)
		return
	}
	templates.ExecuteTemplate(w, "car-details.html", car)
}

func carImagesHandler(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.URL.Query().Get("id"))
	car, err := db.GetCarByID(id)
	if err != nil {
		http.Error(w, "Failed to load car images", http.StatusInternalServerError)
		return
	}
	templates.ExecuteTemplate(w, "car-images.html", car.Images)
}

func adminHandler(w http.ResponseWriter, r *http.Request) {
	cars, err := db.GetAllCars()
	if err != nil {
		http.Error(w, "Failed to load admin page", http.StatusInternalServerError)
		return
	}
	templates.ExecuteTemplate(w, "admin.html", cars)
}

func addCarHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		r.ParseForm()
		car := models.Car{
			Name:             r.FormValue("name"),
			Year:             r.FormValue("year"),
			Color:            r.FormValue("color"),
			InteriorColor:    r.FormValue("interiorColor"),
			InteriorType:     r.FormValue("interiorType"),
			Odometer:         r.FormValue("odometer"),
			Price:            r.FormValue("price"),
			VIN:              r.FormValue("vin"),
			LicenseExpiration: r.FormValue("licenseExpiration"),
			InsuranceExpiration: r.FormValue("insuranceExpiration"),
			LastServiced:     r.FormValue("lastServiced"),
			PartsNeeded:      r.FormValue("partsNeeded"),
			Problems:         r.FormValue("problems"),
		}
		err := db.AddCar(car)
		if err != nil {
			http.Error(w, "Failed to add car", http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, "/admin", http.StatusSeeOther)
	} else {
		http.NotFound(w, r)
	}
}

func deleteCarHandler(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.URL.Query().Get("id"))
	err := db.DeleteCarByID(id)
	if err != nil {
		http.Error(w, "Failed to delete car", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, "/admin", http.StatusSeeOther)
}
