import axios from "axios";
import Cookies from "js-cookie";
import plMessages from "./lang/pl.json";
import enMessages from "./lang/en.json";

const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbkR0byI6eyJpZCI6NiwiaW1pZSI6Ik1vbml0b3IiLCJuYXp3aXNrbyI6ImF3YXJpaSIsImxvZ2luIjoibW9uaXRvciIsInJvbGEiOiJtb25pdG9yIn0sImlhdCI6MTY3OTg1MjkxNn0.qkqPjY2ctt-x0WDbwgk4nV7VYxWa3XNQur9vlZ_2D2U";

const messages = {
	pl: plMessages,
	en: enMessages,
};

const userLanguage = navigator.language.substring(0, 2) || "en";

export default {
	data() {
		return {
			priorytet: "",
			mozna_pracowac: null,
			opis_awarii: "",
			inputWorkstationId: "",
			showingForm: false,
			showingList: false,
			reports: [],
			workstations: [],
			workstationId: null,
			workstationName: null,
			showingDetails: false,
			showSuccessModal: false,
			report: "",
		};
	},
	methods: {
		t(key) {
			return messages[userLanguage][key] || key;
		},
		async saveWorkstationId() {
			Cookies.set("workstationId", this.inputWorkstationId);
			this.workstationId = this.inputWorkstationId;
			const selectedWorkstation = this.workstations.find(
				(workstation) => workstation.id == this.inputWorkstationId
			);

			if (selectedWorkstation) {
				Cookies.set("workstationName", selectedWorkstation.nazwa);
				this.workstationName = selectedWorkstation.nazwa;
			}
		},
		async showForm() {
			if (this.showingForm) {
				this.showingForm = false;
			} else {
				this.showingForm = true;
				this.showingList = false;
			}
		},
		async loadWorkstations() {
			try {
				const response = await axios.get(
					"https://projektzespolowyitm-production.up.railway.app/api/stanowiska/lista",
					{
						headers: { "x-access-token": `${token}` },
					}
				);
				this.workstations = response.data;
			} catch (error) {
				console.error(error);
			}
		},
		async loadReports() {
			try {
				const response = await axios.get(
					`https://projektzespolowyitm-production.up.railway.app/api/awarie/stanowisko/${this.workstationId}`,
					{
						headers: { "x-access-token": `${token}` },
					}
				);
				this.reports = response.data;
			} catch (error) {
				console.error(error);
			}
		},
		async showList() {
			if (this.showingList) {
				this.showingList = false;
			} else {
				this.showingForm = false;
				this.showingList = true;
			}
		},
		async submitForm() {
			try {
				const response = await axios.post(
					"https://projektzespolowyitm-production.up.railway.app/api/awarie/dodaj",
					{
						mozna_pracowac: Boolean(this.mozna_pracowac),
						opis_awarii: this.opis_awarii,
						stanowisko: parseInt(this.workstationId),
						priorytet: parseInt(this.priorytet),
					},
					{
						headers: { "x-access-token": `${token}` },
					}
				);
				if (response.data === "Success") {
					this.showSuccessModal = true;

					setTimeout(() => {
						this.showSuccessModal = false;
					}, 3000);

					this.loadReports();
					this.priorytet = "";
					this.mozna_pracowac = "";
					this.opis_awarii = "";
				}
			} catch (error) {
				console.error(error);
			}
		},
	},
	mounted() {
		this.loadWorkstations();
		const savedWorkstationId = Cookies.get("workstationId");
		if (savedWorkstationId) {
			this.workstationId = savedWorkstationId;
			this.loadReports();
		}
		const savedWorkstationName = Cookies.get("workstationName");
		if (savedWorkstationName) {
			this.workstationName = savedWorkstationName;
		}
	},
};