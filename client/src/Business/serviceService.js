const baseUrl = '/services/'
let services = [
    {
        label: "Délégation de compétences",
        description: "Restez centré sur vos besoins métiers en externalisant chez Eliade.",
        text: "Face aux <b>enjeux stratégiques</b> de la disponibilité des systèmes d'information, la <b>délégation de compétences</b> garantit un niveau de service adapté à vos besoins.<br><br>En externalisant certaines tâches, vous <b>resterez centré</b> sur vos métiers et vos collaborateurs se concentreront sur les projets à <b>fortes valeurs ajoutées</b>.<br><br>Eliade, <b>spécialiste des métiers de l'exploitation</b> et de la production informatique, vous proposera des profils ayant de nombreux retours d'expérience sur les considérations informatiques actuelles des grands comptes.<br><br>Quel que soit votre secteur d'activité (Retail, Banque Assurance, Industrie ...) la délégation de compétences vous permettra de bénéficier de l'expertise d'Eliade pour la durée de vos projets.<br><br>Cette souplesse vous permettra d'<b>optimiser vos budgets informatiques</b> en ajustant au mieux la durée de prestation.",
        image: "images/thumbnails/delegation.png",
        section: "skills",
        page: baseUrl + "skills"
    },
    {
        label: "Audit et conseil",
        description: "Tirez le meilleur profit de votre système d'information.",
        text: "<b>Eliade</b> propose un <b>audit permettant de mettre en évidence les points faibles et les points forts de vos infrastructures</b>.À l'issue de cette phase d'audit, nos experts émettront les préconisations nécessaires à l'optimisation et la sécurisation de votre système d'information.<br><br>Au besoin, l'équipe projet pourra vous <b>accompagner dans la mise en œuvre</b> des préconisations de manière fiable et efficace. Le but étant que vous puissiez tirer <b>le meilleur profit</b> de votre système d'information.<br><br>Notre expertise doit être un soutien pour des décideurs qui ne sont pas obligatoirement familiarisés avec les <b>aspects techniques de leur système d'information</b>.",
        image: "images/thumbnails/audits.png",
        section: "audit",
        page: baseUrl + "audit"
    },
    {
        label: "Projet et expertise",
        description: "Profitez de l'expertise de nos collaborateurs.",
        text: "Le pôle Projet & Expertise a pour objectif de <b>vous accompagner</b> dans les phases d'implémentation et/ou d'évolution des <b>infrastructures Microsoft</b> (à demeure ou dans le cloud) et des solutions connexes (Kemp, Barracuda…).<br><br>Les collaborateurs du département « Projet et Expertise » interviennent uniquement en mode projet ou en expertise <b>ponctuelle</b>. Ils sont <b>certifiés sur les solutions liées à leurs spécialités</b> : Exchange, Lync, Active Directory, Azure, Kemp, etc.<br><br>Deux de nos collaborateurs sont certifiés <b>« formateurs officiels Microsoft »</b> (MCT). Pour garantir la qualité de nos projets, l'un de nos collaborateurs est également <b>certifié « Prince2 »</b> (méthode projet reconnue dans le monde de l'IT).<br><br>L'expertise d'<b>Eliade</b> lui a permis d'intégrer le programme <b>Partner Seller</b> (P-Seller) mis en place par Microsoft, ce programme est composé d'une centaine d'experts sélectionnés parmi l'élite de la communauté de partenaires de Microsoft. Leur rôle principal est de communiquer la valeur des solutions Microsoft aux clients et de leur fournir des conseils d'architecture de <b>solutions d'intégration d'entreprise</b>. Le programme Microsoft Partner Seller a été conçu pour <b>faciliter la relation</b> avec les partenaires Microsoft ainsi que les équipes produits au niveau national et régional. Ce programme permet ainsi à des experts partenaires de réaliser des avant-ventes, d'assurer la partie « technico-commerciale », de <b>cadrer le besoin du client</b> et vérifier que la technologie correspond et peut répondre à leur demande.",
        image: "images/thumbnails/meeting.png",
        section: "project",
        page: baseUrl + "project"
    },
    {
        label: "Formation d'expertise Traineed",
        description: "Formez vos équipes informatiques sur les solutions Microsoft.",
        text : "Pour vous accompagner aux mieux dans vos projets IT et dans la prise en main des nouveaux outils, <b>Eliade</b> propose son offre de formation d'expertise Traineed <b>à destination de vos équipes informatiques</b>.<br><br>Organisme de formation agréé, Eliade propose des sessions de formation apportant à vos équipes informatiques les bases nécessaires à l'administration quotidienne et facilitant la <b>mise en place des solutions Microsoft</b>. Ces formations se basent sur les cours officiels Microsoft et pourront être adaptées en fonction de vos attentes et contraintes.<br><br>Des ouvrages spécifiques aux technologies Microsoft présentées sont systématiquement proposés. Les sessions destinées aux utilisateurs finaux se basent sur des apports théoriques et pratiques visant à apporter les connaissances nécessaires à l'utilisation des nouvelles fonctionnalités et des nouveaux usages.<br><br>Totalement interactives, ces formations permettent de sensibiliser aux mieux les utilisateurs. <b>À l'issue de chaque session, un support pédagogique est remis à chaque participant</b> afin d'accéder rapidement aux fonctionnalités essentielles du produit présenté. Ces formations sont assurées par les membres du département Projet et Expertise qui possèdent de <b>nombreuses certifications</b> (Notamment Microsoft Certified Trainer) et de nombreux retours d'expérience.",
        image: "images/thumbnails/training.png",
        section: "traineed",
        page: baseUrl + "traineed"
    },
    {
        label: "Support et assistance Manageo",
        description: "Bénéficiez d'un accès privilégié au support Manageo Eliade.",
        text: "L'offre MANAGEO d'Eliade permet à nos clients de <b>bénéficier d'un support technique</b> de niveau 3 assuré par des consultants experts sur les technologies Microsoft.<br><br>Ce support est une réassurance pour votre infrastructure, vos équipes informatiques internes peuvent ainsi se <b>focaliser sur leurs besoins métiers. Ce service est ouvert du lundi au vendredi (hors jours fériés)</b> et peut être associé <b>au plus haut niveau de support Microsoft (Support Premier)</b>. La voilure du contrat et les technologies Microsoft à couvrir sont définies à la souscription.<br><br>Notre <b>proximité</b> et nos retours d'expérience sont les facteurs différenciateurs de cette offre de support.",
        image: "images/thumbnails/friends2.png",
        section : "manageo",
        page: baseUrl + "manageo"
    },
    {
        label: "Conduite du changement",
        description: "Accompagnez vos utilisateurs finaux sur les solutions Office 365.",
        text : "<b>Tout projet de transformation numérique entraîne un changement</b> au sein de l'entreprise. Ces changements peuvent parfois <b>causer des réactions de résistance ou de désengagement de la part des utilisateurs</b>. Nos retours d'expérience sur les projets de passages à Office 365 nous prouvent qu'il est nécessaire d'adopter une méthodologie permettant de prévenir et de gérer les aspects humains.<br><br>Partant de ce constat, nous avons <b>mis en place une méthode de conduite du changement visant à impliquer et à informer les utilisateurs finaux dans le projet</b>. Cette démarche facilite l'acceptation et permet d'obtenir l'adhésion des membres de l'entreprise au projet de changement.",
        image: "images/thumbnails/team.png",
        section: "changes",
        page: baseUrl + "changes"
    }
];

export let getServices = () => services;
export let getLinkAll = () => { return { name: "Tous nos services", url: "/services" } };