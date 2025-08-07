import axios from "axios";

export async function getCEPLocation(cep: string) {
	try {
		const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
		if (response.data.erro) {
			return null;
		}
		return response.data;
	} catch (error) {
		console.error(error);
		return null;
	}
}
