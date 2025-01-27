package models

type Car struct {
	ID                int
	Name              string
	Year              string
	Color             string
	InteriorColor     string
	InteriorType      string
	Odometer          string
	Price             string
	VIN               string
	LicenseExpiration string
	InsuranceExpiration string
	LastServiced      string
	PartsNeeded       string
	Problems          string
	Images            []string
}
