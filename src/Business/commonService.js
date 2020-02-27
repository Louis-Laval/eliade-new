const socialData = {
    title: "Retrouvez-nous sur les réseaux sociaux",
    socials: [
      { image: "images/facebook-icon.png", url: "https://www.facebook.com/eliade.experts/"},
      { image: "images/linkedin-icon.png", url: "https://www.linkedin.com/company/eliade/"},
    ]
};

const navbarData = [
  { id: 1, url: "#company", label: "Notre entreprise" },
  { id: 2, url: "#services", label: "Nos services" },
  { id: 3, url: "#offers", label: "Nos offres" },
  { id: 4, url: "#partners", label: "Nos partenaires" },
  { id: 5, url: "#contacts", label: "Contacts" }
];

const footerData = {
  description:
    "Créée en 2001, Eliade est une société de services experte des solutions Microsoft, qui se place aujourd'hui comme un acteur incontournable dans la région des Hauts de France.",
  contactDetails: {
    title: "Contactez-nous",
    address: `120 Avenue Clément Ader<br>Parc d'Activité Du Moulin<br>59118 Wambrechies`,
    mobile: "03 20 80 02 96",
    email: "contact@eliade.fr"
  },
  subscribeNewsletter: "Subscribe newsletter",
  subscribe: "Subscribe"
};

const header = "Eliade";

export const getSocialData = () => socialData;
export const getNavbarData = () => navbarData;
export const getFooterData = () => footerData;
export const getHeader = () => header;