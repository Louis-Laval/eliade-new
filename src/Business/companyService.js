let baseUrl = "/company/";
let company = [
    {
        label: "Recrutement",
        description: "Toutes nos offres d'emploi.",
        image: "images/service1.png",
        page: baseUrl + "recruiting"
    },
    {
        label: "Nos certifications",
        description: "",
        image: "images/service2.png",
        page: baseUrl + "certifications"
    },
    {
        label: "Pôles de compétences",
        description: "",
        image: "images/service3.png",
        page: baseUrl + "skills"
    }
];

export let getCompany = () => company;