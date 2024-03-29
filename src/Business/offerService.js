const baseUrl = "/offers/";
let offers = [
    {
        label: "Go Data",
        description:
            "Libérez le potentiel de vos données, anticipez, et gagnez en réactivité dans vos prises de décision et vos choix stratégiques.",
        image: "images/service1.png",
        page: baseUrl + "go-data"
    },
    {
        label: "Go Fast",
        description:
            "Bénéficiez d'une installation rapide d'Office 365 et des services Eliade associés, à coûts maitrisés.",
        image: "images/service2.png",
        page: baseUrl + "go-fast"
    },
    {
        label: "Go Smart",
        description:
            "Profitez des services avancés Eliade pour optimiser votre transition vers les solutions O365.",
        image: "images/service3.png",
        page: baseUrl + "go-smart"
    },
    {
        label: "Go Teams",
        description:
            "Centralisez vos outils de collaboration et de communication sur une plateforme unique.",
        image: "images/service3.png",
        page: baseUrl + "go-teams"
    },
    {
        label: "Go Access & Security",
        description:
            "Protégez vos données depuis le Cloud, gérez vos équipements mobiles et gagnez en flexibilité.",
        image: "images/service1.png",
        page: baseUrl + "go-access-security"
    },
    {
        label: "Go Finops",
        description:
            "Rubrique sans description sur le site original.",
        image: "images/service2.png",
        page: baseUrl + "go-finops"
    }
];

let addNewOffer = (label, description, url) => {
    offers.push({ label, description, url });
};

let getOffers = () => offers;

export { addNewOffer, getOffers }