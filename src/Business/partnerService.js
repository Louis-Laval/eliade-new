const baseUrl = "/partners/";
let partners = [
    {
        label: "Kemp",
        description: "KEMP Technologies fournit des Load Balancer et LoadMaster pour les entreprises de toute taille.",
        image: "images/service1.png",
        id: "kemp",
        url: "https://www.youtube.com/embed/yiQQBvatGuo",
        text: "<b>KEMP</b> Technologies propose des <b>solutions d'équilibrage de charges</b> (Load Balancing) et de publication d'applications (<b>Reverse Proxy</b>). Depuis l'arrêt de commercialisation de la solution Microsoft TMG (Threat Management Gateway), KEMP se positionne comme <b>une alternative performante et fiable</b>. Ils proposent également une solution de Pare-feu applicatif (WAF) permettant de bloquer de nombreuses attaques.<br><br>Partenaire Gold Microsoft, KEMP est une solution préconisée par l'éditeur pour la publication de services comme <b>Exchange</b> pour les modes hybride avec <b>O365</b> mais également l'équilibrage de charges des <b>solutions On Premise</b> (Exchange, Skype For Business, SharePoint...).",
        index: 0,
        page: baseUrl + 0
    },
    {
        label: "Letsignit",
        description: "Standardisez et gérez les signatures mails de vos collaborateurs.",
        image: "images/service2.png",
        id: "letsignit",
        url: "https://www.youtube.com/embed/i7-EmRKTBck",
        text: "Letsignit est une solution centralisée de gestion de signatures mails.<br>En quelques clics, Letsignit permet simplement de créer et de distribuer des signatures mails automatisées pour tous les utilisateurs d'Office 365 !<br><b>L'image de marque est ainsi boostée et la communication amplifiée au travers de tous les emails professionnels.</b><br><br>Les emails sont une vraie mine d'or ! 121 emails professionnels sont reçus et 40 sont envoyés par un salarié chaque jour. Avec Letsignit, transformez chaque email en puissante opportunité de communication : adressez le bon message, à la bonne personne, au bon moment !<br><br><b>Tout automatique !</b> Avec Letsignit App, les signatures sont intégrées à chaque nouveau courriel dans Outlook. Letsignit API permet de couvrir les collaborateurs qui utilisent OWA.<br>Facile à CRÉER, facile à UTILISER, facile à DÉPLOYER.<br><b>Transformez vos signatures mails en puissant atout de communication avec Letsignit !</b>",
        index: 1,
        page: baseUrl + 1
    },
    {
        label: "Poly",
        description: "L'un des leaders mondiaux dans les communications audio pour les entreprises et le grand public.",
        image: "images/service3.png",
        id: "poly",
        url: "https://www.youtube.com/embed/llHa5vUq5PI",
        text: "Depuis <b>50 ans</b>, Poly explore toutes les facettes <b>des technologies audio et propose des produits innovants</b> qui permettent à tous de communiquer, simplement. Des solutions de <b>communication unifiée</b> aux oreillettes Bluetooth, Plantronics offre une qualité sans compromis, <b>une expérience conviviale</b> et un service irréprochable.<br><br>Poly est aujourd'hui utilisé par toutes les entreprises du « Fortune 100 », ainsi que par le centre des urgences 911, le contrôle du trafic aérien et le New York Stock Exchange.<br><br>Depuis les communications unifiées jusqu'aux micro-casques et oreillettes Bluetooth, les produits Poly <b>simplifient la communication</b>.",
        index: 2,
        page: baseUrl + 2
    },
    {
        label: "Jabra",
        description: "Micro-casques pour une meilleure concentration et des conversations de qualité.",
        image: "images/service2.png",
        id: "jabra",
        url: "https://www.youtube.com/embed/mA1qCnk4Lg4",
        text: "Les entreprises sont de plus en plus amenées à <b>communiquer malgré la distance</b>. Dans ce contexte <b>Jabra</b> vous offre des <b>outils audio de qualité</b> pour optimiser vos communications.<br><br>Leurs micros-casques permettent d'être <b>plus productif, plus concentré et de communiquer et collaborer plus facilement</b>. Ces solutions rendent également vos conversations plus <b>fluides en bloquant les bruits indésirables</b> et en restituant un son d'une grande clarté.<br><br>La volonté de Jabra : repousser les limites de l'innovation et des performances : c'est pourquoi les équipes déploient tous leurs efforts pour améliorer sans cesse la qualité audio de nos appareils.<br><br>Leader en matière de son, la société consacre chaque année plus de 10% de son chiffre d'affaires à la <b>recherche et au développement</b>. Cette stratégie  permet à Jabra de rester à la <b>pointe de l'innovation technologique</b>.",
        index: 3,
        page: baseUrl + 3
    },
    {
        label: "Microsoft Surface",
        description: "Votre environnement de travail dans une tablette.",
        image: "images/service3.png",
        id: "mssurface",
        url: "https://www.youtube.com/embed/mA1qCnk4Lg4",
        text: "Avec l'accélération du business, <b>les collaborateurs</b> doivent être plus agiles et réactifs. Ils aiment avoir des tablettes mais ont besoin de la <b>puissance</b> d'un véritable ordinateur pour effectuer leur travail et généralement, ils se retrouvent à se déplacer avec les deux.<br><br>Surface apparait alors comme <b>l'appareil idéal</b> pour une personne fréquemment en déplacement lui permettant d'investir tout son temps à son <b>cœur de métier</b>.<br><br>Les appareils Surface sont conçus de façon méticuleuse par Microsoft au moyen des <b>technologies les plus avancées</b>. Dotée d'un processeur Intel, de Windows Pro, d'un clavier clipsable, et d'une <b>qualité rivalisant de réalité grâce à PixelSense™</b>, Surface s'utilise comme un portable et <b>exécute les logiciels de bureau qui vous sont indispensables</b>.<br></br>Enfin, grâce à ses <b>multiples ports</b> et <b>son stylet</b>, Surface redéfinit la <b>productivité où que vous soyez</b>, au bureau, dans un atelier ou dans un café.",
        index: 4,
        page: baseUrl + 4
    },
    {
        label: "BitTitan",
        description: "Rubrique sans description sur le site original.",
        image: "images/service1.png",
        id: "bittitan",
        url: "https://www.youtube.com/embed/awAFxatDOK4",
        text: "Avec BitTitan, migrez vos boites mails, vos documents, de partout où et à n'importe quel moment.<br><br>BitTian est une plateforme SaaS conçue pour aider les entreprises à organiser, optimiser et automatiser leur migration.<br><br></br>Compatible avec Lotus Note, Gsuite, O365 ...",
        index: 5,
        page: baseUrl + 5
    }
];

export let getPartners = () => partners;
export let getLinkAll = () => { return { name: "Tous nos partenaires", url: "/partners" } };