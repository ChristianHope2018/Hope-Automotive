package db

import (
	"car-listings/models"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var db *sql.DB

func ConnectDB() error {
	var err error
	connStr := "postgresql://hopeautodb_owner:npg_0gaVuNdLD8Gn@ep-quiet-paper-a55rn5gj-pooler.us-east-2.aws.neon.tech/hopeautodb?sslmode=require"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}
	return db.Ping()
}

func CloseDB() {
	db.Close()
}

func GetAllCars() ([]models.Car, error) {
	rows, err := db.Query("SELECT * FROM cars")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cars []models.Car
	for rows.Next() {
		var car models.Car
		err := rows.Scan(&car.ID, &car.Name, &car.Year, &car.Color, &car.InteriorColor, &car.InteriorType,
			&car.Odometer, &car.Price, &car.VIN, &car.LicenseExpiration, &car.InsuranceExpiration,
			&car.LastServiced, &car.PartsNeeded, &car.Problems)
		if err != nil {
			return nil, err
		}
		cars = append(cars, car)
	}
	return cars, nil
}

func GetCarByID(id int) (models.Car, error) {
	row := db.QueryRow("SELECT * FROM cars WHERE id = $1", id)
	var car models.Car
	err := row.Scan(&car.ID, &car.Name, &car.Year, &car.Color, &car.InteriorColor, &car.InteriorType,
		&car.Odometer, &car.Price, &car.VIN, &car.LicenseExpiration, &car.InsuranceExpiration,
		&car.LastServiced, &car.PartsNeeded, &car.Problems)
	return car, err
}

func AddCar(car models.Car) error {
	query := `INSERT INTO cars (name, year, color, interior_color, interior_type, odometer, price, vin,
		license_expiration, insurance_expiration, last_serviced, parts_needed, problems)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
	_, err := db.Exec(query, car.Name, car.Year, car.Color, car.InteriorColor, car.InteriorType, car.Odometer, car.Price,
		car.VIN, car.LicenseExpiration, car.InsuranceExpiration, car.LastServiced, car.PartsNeeded, car.Problems)
	return err
}

func DeleteCarByID(id int) error {
	_, err := db.Exec("DELETE FROM cars WHERE id = $1", id)
	return err
}
