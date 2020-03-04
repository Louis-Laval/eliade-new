let baseUrl = "/company/";
let company = [
    {
        label: "Recrutement",
        description: "Toutes nos offres d'emploi.",
        image: "images/thumbnails/list.png",
        page: baseUrl + "recruiting"
    },
    {
        label: "Nos certifications",
        description: "",
        image: "images/thumbnails/statistics.png",
        page: baseUrl + "certifications"
    },
    {
        label: "Pôles de compétences",
        description: "",
        image: "images/thumbnails/tool.png",
        page: baseUrl + "skills"
    }
];

export let getCompany = () => company;