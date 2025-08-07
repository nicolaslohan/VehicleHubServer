import axios from "axios";
import { encode } from "punycode";

const mainMakes = [
	"Fiat",
	"Volkswagen",
	"Chevrolet",
	"Hyundai",
	"Toyota",
	"Renault",
	"Jeep",
	"BYD",
	"Honda",
	"Caoa Chery",
	"Ford",
	"GWM",
	"Citroen",
	"RAM",
	"Mitsubishi",
	"Pegeout",
	"BMW",
	"Mercedes-Benz",
	"Volvo",
];

async function getModelsMakes(make: string) {
	try {
		const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`;
		const response = await axios.get(url);
		const models = response.data.Results.map((m: any) => m.Model_Name);
		return models;
	} catch (error) {
		console.error(error);
		return [];
	}
}

export async function getAllModels() {
	const results: Record<string, any[]> = {};
	for (const make of mainMakes) {
		results[make] = await getModelsMakes(make);
	}
	return results;
}
