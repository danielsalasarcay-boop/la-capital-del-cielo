# Contenido de las páginas legales de La Capital del Cielo (terminos.html, privacidad.html, cookies.html).
# Regenerar: python3 tools/legal/legalgen.py tools/legal/config.py .
# Al cambiar un texto de fondo, sube VERSION y la fecha de UPDATED.
#
# PENDIENTE (lo da el dueño): razón social y RIF. Cuando estén, añadirlos en
# "Quiénes somos" (Términos) y "Responsable" (Privacidad).

VERSION = "2026-10-25.2"
WA = '<a href="https://wa.me/584127398347">+58 412 7398347</a>'
MAIL = '<a href="mailto:info@lacapitaldelcielo.com">info@lacapitaldelcielo.com</a>'
IG = '<a href="https://www.instagram.com/lacapitaldelcielo" rel="noopener">@lacapitaldelcielo</a>'

SITE = {
    "name": "La Capital del Cielo",
    "brand_html": '<img src="img/general/logo-sm.png" alt="La Capital del Cielo" style="height:44px;width:auto;display:block" onerror="this.replaceWith(document.createTextNode(\'La Capital del Cielo\'))">',
    "kicker": {"es": "La Capital del Cielo · Los Roques", "en": "La Capital del Cielo · Los Roques"},
    "langs": ["es", "en"],
    "lang_key": "lcdc-lang",
    "home": {"es": "index.html", "en": "index.html"},
    "files": {"terms": "terminos.html", "privacy": "privacidad.html", "cookies": "cookies.html"},
    "version": VERSION,
    "updated": {"es": "25 de octubre de 2026", "en": "October 25, 2026"},
    "head": '<link rel="icon" href="favicon.ico" sizes="48x48">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Tenor+Sans&display=swap" rel="stylesheet">',
    "style": {
        "bg": "#FFFFFF", "ink": "#1A1A1A", "muted": "#5E6670", "accent": "#2F78BD", "line": "#E2E8F0", "card": "#F3F8FD",
        "display": "'Marcellus', Georgia, serif", "body": "'Tenor Sans', system-ui, sans-serif",
        "brand_size": "20px", "brand_track": "0.02em", "h_weight": "400",
    },
}

T_ES = [
    ("1. Quiénes somos", [
        f"La Capital del Cielo es una empresa venezolana que alquila casas privadas de lujo en Los Roques, con staff y atención personalizada en cada estadía. Contacto: WhatsApp {WA}, correo {MAIL} e Instagram {IG}.",
    ]),
    ("2. Qué ofrecemos", [[
        "Estadías en las casas privadas que se muestran en el sitio, en el Parque Nacional Archipiélago Los Roques, Venezuela. La capacidad, lo que incluye y lo que no incluye cada casa se indican en su ficha; las condiciones definitivas de cada estadía son las de la confirmación de reserva.",
        "Venta de camisas de La Capital del Cielo a través de la sección Merchandise.",
        "La confirmación de reserva indica quién presta el alojamiento (La Capital del Cielo o el propietario de la casa) y a quién se hace el pago. La Capital del Cielo responde por la gestión de tu reserva y por la información que te da; cuando sea el propietario quien presta el alojamiento, él responde por el estado de la casa y por los servicios incluidos.",
    ]]),
    ("3. Cómo se reserva una casa", [[
        "Los formularios de reserva y de contacto, y los botones de WhatsApp, solo preparan un mensaje que tú decides enviar. Enviarlo es una consulta: no es una reserva ni genera ningún pago.",
        "El calendario de disponibilidad del sitio es orientativo. La disponibilidad solo es definitiva cuando te la confirmamos por escrito.",
        "La reserva queda confirmada cuando te enviamos por escrito (WhatsApp o correo) la confirmación con la casa, las fechas, el número de huéspedes, el precio total, lo que incluye, la forma de pago y las condiciones de cancelación, y recibimos el pago o el anticipo que ella indique. Al pagar aceptas esa confirmación y estos términos.",
        "Para confirmar la reserva te pediremos solo los datos necesarios: nombre completo, documento de identidad o pasaporte de los huéspedes, cuando lo exija la ley o la autoridad del Parque Nacional, y los datos del pago.",
        "Las comunicaciones y aceptaciones por medios electrónicos (WhatsApp o correo) tienen plena validez, conforme a la Ley sobre Mensajes de Datos y Firmas Electrónicas.",
        "Quien reserva debe ser mayor de edad y responde por el grupo de huéspedes.",
    ]]),
    ("4. Precios y pagos", [[
        "El precio de cada estadía es el que indica la confirmación de reserva, en dólares estadounidenses y su equivalente en bolívares a la tasa oficial del Banco Central de Venezuela del día del pago, conforme a la normativa vigente.",
        "Los pagos en divisas pueden estar sujetos al Impuesto a las Grandes Transacciones Financieras (IGTF) cuando la ley lo exija.",
        "Los precios en dólares son referenciales. El precio es el mismo cualquiera sea la moneda de pago: si pagas en bolívares, se calcula a la tasa oficial del Banco Central de Venezuela del día del pago.",
        "Salvo que la confirmación diga otra cosa, el precio no incluye boletos aéreos ni traslados hasta Los Roques, ni la tasa de ingreso al Parque Nacional que cobra la autoridad competente.",
    ]]),
    ("5. Cancelaciones y cambios", [
        "Las cancelaciones, los cambios de fecha y los reembolsos se rigen por las condiciones indicadas en la confirmación de reserva, que conoces y aceptas antes de pagar.",
        "Si no te presentas en la fecha de llegada sin avisarnos, se trata como una cancelación, según las condiciones de la confirmación de reserva.",
        "Si tuviéramos que cancelar una reserva confirmada por una causa que no sea tuya, te devolveremos el 100 % de lo pagado o, si lo prefieres, te ofreceremos otras fechas u otra casa disponible.",
    ]),
    ("6. Normas de la estadía", [[
        "No se admite un número de huéspedes mayor al confirmado.",
        "Los huéspedes deben respetar las normas del Parque Nacional Archipiélago Los Roques y de sus autoridades, en especial sobre fauna, arrecifes, residuos y pesca.",
        "Los huéspedes responden por los daños que causen a la casa, su mobiliario o equipos, más allá del desgaste normal. Podrá pedirse un depósito de garantía si así lo indica la confirmación.",
        "Los menores de edad deben estar acompañados en todo momento por sus padres o por un adulto responsable, que responde por ellos.",
        "Las normas sobre mascotas, fumar, visitas y horarios de descanso son las que indica la confirmación de reserva. Si no se cumplen, podremos pedir que se corrija y, si es grave o se repite, terminar la estadía.",
        "Cuida tus objetos de valor: La Capital del Cielo no responde por la pérdida o el daño de objetos personales, salvo que se deba a culpa suya o de su personal.",
    ]]),
    ("7. Actividades en el mar y excursiones", [
        "Las salidas en bote, el baño en el mar, el snorkel y las demás actividades en el agua o en los cayos tienen riesgos propios. Debes seguir las indicaciones del personal y de quien conduzca el bote, usar chaleco salvavidas cuando se indique, no participar bajo los efectos del alcohol y vigilar en todo momento a los menores.",
        "Participas bajo tu propia responsabilidad, salvo en lo que se deba a culpa de La Capital del Cielo o de su personal. Te recomendamos contratar un seguro de viaje con cobertura médica.",
    ]),
    ("8. Si algo no está bien durante tu estadía", [
        "Si algo no funciona o no corresponde con lo confirmado, avísanos de inmediato, durante la estadía, para poder solucionarlo. Lo que no se reporta durante la estadía es más difícil de verificar y resolver después.",
    ]),
    ("9. Camisas (Merchandise)", [[
        "Al usar el carrito y pulsar «Enviar pedido por WhatsApp» se prepara un mensaje con tu pedido. Es una solicitud: la compra queda confirmada cuando te confirmamos por WhatsApp la disponibilidad de las tallas, el total, la forma de pago y la forma de entrega, y recibimos el pago.",
        "Los precios publicados están en dólares estadounidenses y son referenciales: el precio es el mismo cualquiera sea la moneda de pago, y si pagas en bolívares se calcula a la tasa oficial del Banco Central de Venezuela del día del pago. Los colores pueden variar ligeramente respecto a las fotos según la pantalla.",
        "Si una camisa llega con un defecto de fabricación, avísanos por WhatsApp o correo y te la cambiaremos o te devolveremos lo pagado, conforme a la ley.",
    ]]),
    ("10. Fuerza mayor", [
        "Ninguna de las partes responde por incumplimientos causados por hechos ajenos a su control que no pudo prever ni evitar (causa extraña no imputable, artículo 1.272 del Código Civil): suspensión de vuelos, cierre del acceso al Parque Nacional, condiciones climáticas, cortes de electricidad o de comunicaciones, emergencias sanitarias o decisiones de autoridades. Si ocurre, te avisaremos lo antes posible y buscaremos contigo reprogramar; las consecuencias económicas se resuelven según la confirmación de reserva y la ley.",
    ]),
    ("11. Fotos y contenido del sitio", [
        "Las fotografías muestran las casas, su entorno y Los Roques. Algunas tienen retoques digitales de luz, color o nitidez y son ilustrativas: la decoración, el mobiliario y la vista pueden variar.",
        "Los textos, fotos, logotipo, diseños de las camisas y diseño del sitio pertenecen a La Capital del Cielo o a sus titulares, y se usan con autorización. No pueden copiarse ni reutilizarse sin permiso escrito.",
    ]),
    ("12. Servicios de terceros", [
        "El sitio enlaza con WhatsApp e Instagram y muestra mapas de Google Maps. Esos servicios se rigen por sus propias condiciones y políticas de privacidad.",
    ]),
    ("13. Responsabilidad", [
        "Hacemos lo posible para que la información del sitio sea exacta y esté actualizada, pero la disponibilidad, los precios y los servicios solo son vinculantes en la confirmación escrita. Nada de lo aquí escrito limita los derechos que la ley te reconoce como consumidor, que son irrenunciables.",
    ]),
    ("14. Si nos visitas o contratas desde otro país", [
        "Nuestros servicios se prestan en Venezuela y se rigen por la ley venezolana. Si usas el sitio o contratas desde otro país, eres responsable de cumplir las leyes de tu país. También es tu responsabilidad cumplir los requisitos para entrar a Venezuela y viajar a Los Roques (pasaporte, visado si corresponde y, para menores, los permisos de viaje que exija la ley).",
    ]),
    ("15. Uso del sitio", [
        "No está permitido usar el sitio o nuestros canales de contacto con fines ilícitos o fraudulentos, enviar mensajes masivos no solicitados, intentar acceder sin autorización a sus sistemas ni copiar su contenido de forma automatizada.",
    ]),
    ("16. Ley aplicable y reclamos", [
        "Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Si tienes un reclamo, escríbenos primero por WhatsApp o correo y te responderemos en un plazo máximo de 10 días hábiles. También puedes acudir a la Superintendencia Nacional para la Defensa de los Derechos Socioeconómicos (SUNDDE) o a los tribunales competentes. Para cualquier controversia, las partes eligen como domicilio especial la ciudad de Caracas, a cuyos tribunales se someten, sin perjuicio del fuero que la ley reconozca al consumidor.",
    ]),
    ("17. Cambios", [
        "Podemos actualizar estos términos. La versión vigente es la publicada en esta página con su fecha; cada reserva o compra se rige por la versión vigente cuando fue confirmada.",
    ]),
]

T_EN = [
    ("1. Who we are", [
        f"La Capital del Cielo is a Venezuelan company that rents private luxury homes in Los Roques, with staff and personal attention on every stay. Contact: WhatsApp {WA}, email {MAIL} and Instagram {IG}.",
    ]),
    ("2. What we offer", [[
        "Stays in the private homes shown on the site, in the Archipiélago Los Roques National Park, Venezuela. Each home's capacity, what it includes and what it does not are stated on its page; the final conditions of each stay are those in the booking confirmation.",
        "Sale of La Capital del Cielo shirts through the Merchandise section.",
        "The booking confirmation states who provides the accommodation (La Capital del Cielo or the owner of the home) and to whom payment is made. La Capital del Cielo is responsible for managing your booking and for the information it gives you; when the owner provides the accommodation, the owner is responsible for the condition of the home and the included services.",
    ]]),
    ("3. How to book a home", [[
        "The booking and contact forms, and the WhatsApp buttons, only prepare a message that you choose to send. Sending it is an inquiry: it is not a booking and involves no payment.",
        "The availability calendar on the site is for guidance only. Availability is only final when we confirm it in writing.",
        "A booking is confirmed when we send you a written confirmation (WhatsApp or email) with the home, dates, number of guests, total price, what is included, payment method and cancellation conditions, and we receive the payment or deposit it states. By paying you accept that confirmation and these terms.",
        "To confirm the booking we will only ask for the necessary data: full name, ID or passport of the guests when required by law or by the National Park authority, and payment details.",
        "Electronic communications and acceptances (WhatsApp or email) are fully valid under Venezuela's Law on Data Messages and Electronic Signatures.",
        "The person booking must be of legal age and is responsible for the group of guests.",
    ]]),
    ("4. Prices and payments", [[
        "The price of each stay is the one stated in the booking confirmation, in US dollars and its equivalent in bolívares at the official Central Bank of Venezuela rate on the payment date, as required by law.",
        "Payments in foreign currency may be subject to the Large Financial Transactions Tax (IGTF) when required by law.",
        "Prices in US dollars are for reference. The price is the same whatever the currency of payment: if you pay in bolívares, it is calculated at the official Central Bank of Venezuela rate on the payment date.",
        "Unless the confirmation says otherwise, the price does not include flights or transfers to Los Roques, nor the National Park entry fee charged by the authorities.",
    ]]),
    ("5. Cancellations and changes", [
        "Cancellations, date changes and refunds are governed by the conditions stated in the booking confirmation, which you know and accept before paying.",
        "If you do not show up on the arrival date without notice, it is treated as a cancellation under the conditions of the booking confirmation.",
        "If we have to cancel a confirmed booking for a reason not attributable to you, we will refund 100% of what you paid or, if you prefer, offer you other dates or another available home.",
    ]),
    ("6. House rules", [[
        "No more guests than confirmed are allowed.",
        "Guests must follow the rules of the Archipiélago Los Roques National Park and its authorities, especially regarding wildlife, reefs, waste and fishing.",
        "Guests are liable for damage they cause to the home, its furniture or equipment beyond normal wear. A security deposit may be requested if the confirmation says so.",
        "Minors must be accompanied at all times by their parents or a responsible adult, who is responsible for them.",
        "The rules on pets, smoking, visitors and quiet hours are those stated in the booking confirmation. If they are not followed, we may ask for it to be corrected and, if serious or repeated, end the stay.",
        "Look after your valuables: La Capital del Cielo is not liable for loss of or damage to personal belongings, unless caused by its fault or that of its staff.",
    ]]),
    ("7. Sea activities and excursions", [
        "Boat trips, swimming in the sea, snorkeling and other activities in the water or on the cays carry their own risks. You must follow the instructions of the staff and of whoever operates the boat, wear a life jacket when told to, not take part under the influence of alcohol and supervise minors at all times.",
        "You take part at your own risk, except for what is due to the fault of La Capital del Cielo or its staff. We recommend taking out travel insurance with medical coverage.",
    ]),
    ("8. If something is wrong during your stay", [
        "If something does not work or does not match what was confirmed, let us know right away, during your stay, so we can fix it. What is not reported during the stay is harder to verify and resolve afterwards.",
    ]),
    ("9. Shirts (Merchandise)", [[
        "Using the cart and tapping “Send order via WhatsApp” prepares a message with your order. It is a request: the purchase is confirmed when we confirm on WhatsApp the availability of sizes, the total, the payment method and the delivery method, and we receive the payment.",
        "Published prices are in US dollars and are for reference: the price is the same whatever the currency of payment, and if you pay in bolívares it is calculated at the official Central Bank of Venezuela rate on the payment date. Colors may vary slightly from the photos depending on your screen.",
        "If a shirt arrives with a manufacturing defect, let us know on WhatsApp or by email and we will replace it or refund what you paid, as required by law.",
    ]]),
    ("10. Force majeure", [
        "Neither party is liable for failures caused by events beyond its control that it could not foresee or avoid (article 1,272 of the Venezuelan Civil Code): flight suspensions, closure of access to the National Park, weather conditions, power or communication outages, health emergencies or decisions of authorities. If this happens, we will notify you as soon as possible and work with you to reschedule; the financial consequences are settled according to the booking confirmation and the law.",
    ]),
    ("11. Photos and site content", [
        "The photographs show the homes, their surroundings and Los Roques. Some have digital adjustments to light, color or sharpness and are illustrative: decoration, furniture and views may vary.",
        "The texts, photos, logo, shirt designs and site design belong to La Capital del Cielo or their owners and are used with permission. They may not be copied or reused without written permission.",
    ]),
    ("12. Third-party services", [
        "The site links to WhatsApp and Instagram and shows Google Maps maps. Those services are governed by their own terms and privacy policies.",
    ]),
    ("13. Liability", [
        "We do our best to keep the site's information accurate and up to date, but availability, prices and services are only binding in the written confirmation. Nothing here limits the rights the law grants you as a consumer, which cannot be waived.",
    ]),
    ("14. If you visit or hire us from another country", [
        "Our services are provided in Venezuela and governed by Venezuelan law. If you use the site or hire us from another country, you are responsible for complying with the laws of your country. You are also responsible for meeting the requirements to enter Venezuela and travel to Los Roques (passport, visa where applicable and, for minors, any travel permits required by law).",
    ]),
    ("15. Use of the site", [
        "You may not use the site or our contact channels for unlawful or fraudulent purposes, send unsolicited bulk messages, attempt unauthorized access to its systems or copy its content by automated means.",
    ]),
    ("16. Governing law and complaints", [
        "These terms are governed by the laws of the Bolivarian Republic of Venezuela. If you have a complaint, write to us first on WhatsApp or by email and we will reply within 10 business days. You may also turn to the National Superintendence for the Defense of Socioeconomic Rights (SUNDDE) or the competent courts. For any dispute, the parties choose the city of Caracas as their special domicile and submit to its courts, without prejudice to the venue the law grants consumers.",
    ]),
    ("17. Changes", [
        "We may update these terms. The current version is the one published on this page with its date; each booking or purchase is governed by the version in force when it was confirmed.",
    ]),
]

P_ES = [
    ("1. Responsable", [
        f"La Capital del Cielo, empresa venezolana con operación en Los Roques, es responsable de los datos que nos das. Para cualquier pregunta sobre tus datos: WhatsApp {WA} o {MAIL}.",
    ]),
    ("2. Qué datos tratamos y para qué", [
        "El sitio no tiene registro de usuarios, no usa cookies propias ni herramientas de analítica o publicidad, y no guarda en ningún servidor lo que escribes en sus formularios. Solo tratamos lo que tú decides enviarnos:",
        ("table", ["Cuándo", "Datos", "Para qué"], [
            ["Formularios de reserva y contacto", "Nombre, casa, fechas y número de personas. Se usan solo para armar, dentro de tu navegador, un mensaje de WhatsApp que tú decides enviar. Si no lo envías, no recibimos nada.", "Preparar tu consulta."],
            ["Carrito de camisas", "Camisas, tallas y cantidades. Se guardan solo en tu navegador hasta que envías el pedido por WhatsApp.", "Preparar tu pedido."],
            ["Si nos escribes por WhatsApp, correo o Instagram", "Tu número, correo o usuario y lo que nos escribas.", "Responderte y gestionar la reserva o la compra."],
            ["Si reservas o compras", "Nombre completo, documento de identidad o pasaporte de los huéspedes (cuando lo exija la ley o la autoridad del Parque), datos del pago y, en compras, los datos para la entrega.", "Ejecutar la reserva o la compra y cumplir obligaciones legales y fiscales."],
            ["Al visitar el sitio", "Datos técnicos de conexión (dirección IP, navegador) que reciben el alojamiento y los proveedores de contenido.", "Entregar la página de forma segura. No accedemos a ellos."],
        ]),
        "Usamos tus datos con tu consentimiento, que das al escribirnos, y para ejecutar la reserva o la compra cuando la confirmas. No vendemos datos, no los usamos para publicidad y no te enviaremos mensajes promocionales sin tu permiso.",
    ]),
    ("3. Con quién se comparten", [
        "Solo con quien hace falta para atenderte, y con las autoridades cuando la ley lo exija:",
        [
            "El personal y los propietarios de la casa que reservas, solo con los datos necesarios para recibirte.",
            "Meta (WhatsApp e Instagram), para las conversaciones que inicias, y nuestro proveedor de correo si nos escribes por correo.",
            "Vercel y GitHub (alojamiento del sitio).",
            "Google (fuentes tipográficas y mapas de Google Maps), que recibe datos técnicos de conexión, como la IP, para entregarlos.",
            "Autoridades públicas cuando una ley lo exija (por ejemplo, registro de huéspedes o requerimientos fiscales).",
        ],
        "Algunos de estos proveedores procesan datos fuera de Venezuela, principalmente en Estados Unidos.",
    ]),
    ("4. Cuánto tiempo los guardamos", [[
        "Conversaciones que no terminan en reserva o compra: hasta 12 meses.",
        "Datos de reservas, compras y pagos: el tiempo que exija la normativa tributaria y mercantil.",
    ]]),
    ("5. Tus derechos", [
        "Puedes pedir en cualquier momento saber qué datos tenemos sobre ti y para qué, que los actualicemos, corrijamos o eliminemos, y retirar tu consentimiento, sin efecto sobre lo hecho antes, conforme a los artículos 28 y 60 de la Constitución. Escríbenos por WhatsApp o correo; responderemos en un máximo de 15 días hábiles. Si pides eliminar tus datos, solo conservaremos lo que exija la ley. Si resides en la Unión Europea, también puedes reclamar ante la autoridad de protección de datos de tu país.",
    ]),
    ("6. Seguridad y menores", [
        "El sitio funciona con conexión cifrada (HTTPS) y tus conversaciones solo las atiende La Capital del Cielo. El sitio no está dirigido a menores de 18 años; las reservas y compras deben hacerlas personas mayores de edad.",
    ]),
    ("7. Cambios", [
        "Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha.",
    ]),
]

P_EN = [
    ("1. Controller", [
        f"La Capital del Cielo, a Venezuelan company operating in Los Roques, is responsible for the data you give us. For any question about your data: WhatsApp {WA} or {MAIL}.",
    ]),
    ("2. What data we process and why", [
        "The site has no user accounts, uses no first-party cookies or analytics or advertising tools, and does not store what you type in its forms on any server. We only process what you choose to send us:",
        ("table", ["When", "Data", "Purpose"], [
            ["Booking and contact forms", "Name, home, dates and number of people. They are only used to build, inside your browser, a WhatsApp message that you choose to send. If you don't send it, we receive nothing.", "Prepare your inquiry."],
            ["Shirt cart", "Shirts, sizes and quantities. Stored only in your browser until you send the order via WhatsApp.", "Prepare your order."],
            ["If you write to us on WhatsApp, email or Instagram", "Your number, email or username and what you write.", "Answer you and manage the booking or purchase."],
            ["If you book or buy", "Full name, ID or passport of the guests (when required by law or the Park authority), payment details and, for purchases, delivery details.", "Carry out the booking or purchase and meet legal and tax obligations."],
            ["When you visit the site", "Technical connection data (IP address, browser) received by the hosting and content providers.", "Deliver the page securely. We do not access it."],
        ]),
        "We use your data with your consent, which you give by writing to us, and to perform the booking or purchase once you confirm it. We do not sell data, use it for advertising or send you promotional messages without your permission.",
    ]),
    ("3. Who we share it with", [
        "Only with those needed to serve you, and with authorities when required by law:",
        [
            "The staff and owners of the home you book, only with the data needed to welcome you.",
            "Meta (WhatsApp and Instagram), for the conversations you start, and our email provider if you email us.",
            "Vercel and GitHub (site hosting).",
            "Google (fonts and Google Maps maps), which receives technical connection data, such as your IP, to deliver them.",
            "Public authorities when required by law (for example, guest registration or tax requests).",
        ],
        "Some of these providers process data outside Venezuela, mainly in the United States.",
    ]),
    ("4. How long we keep it", [[
        "Conversations that do not lead to a booking or purchase: up to 12 months.",
        "Booking, purchase and payment data: as long as tax and commercial law requires.",
    ]]),
    ("5. Your rights", [
        "At any time you may ask what data we hold about you and why, have it updated, corrected or deleted, and withdraw your consent, without affecting what was done before, under articles 28 and 60 of the Venezuelan Constitution. Write to us on WhatsApp or by email; we will reply within 15 business days. If you ask us to delete your data, we will only keep what the law requires. If you live in the European Union, you may also complain to your country's data protection authority.",
    ]),
    ("6. Security and minors", [
        "The site uses an encrypted connection (HTTPS) and your conversations are handled only by La Capital del Cielo. The site is not aimed at people under 18; bookings and purchases must be made by adults.",
    ]),
    ("7. Changes", [
        "If we change this policy, we will publish the new version on this page with its date.",
    ]),
]

C_ES = [
    ("1. Cookies propias", [
        "La Capital del Cielo no usa cookies propias, ni de analítica ni de publicidad. Solo guarda en tu navegador estos datos técnicos, que no te identifican y no salen de tu dispositivo:",
        ("table", ["Nombre", "Para qué", "Duración"], [
            ["lcdc-lang (almacenamiento local)", "Recordar el idioma que elegiste (español o inglés).", "Hasta que lo borres."],
            ["lcdc-carrito-v1 (almacenamiento local)", "Guardar las camisas de tu carrito mientras compras.", "Hasta que vacíes el carrito o lo borres."],
            ["lcdc-intro (almacenamiento de sesión)", "Recordar que ya viste la animación de entrada para no repetirla.", "Se borra al cerrar la pestaña."],
        ]),
    ]),
    ("2. Google Maps", [
        'La ficha de cada casa muestra un mapa de Google Maps. Al cargarse, Google puede instalar sus propias cookies y recibir datos técnicos como tu IP. No accedemos a esas cookies. Si no quieres que se instalen, puedes bloquear las cookies de terceros en tu navegador. Más información en la <a href="https://policies.google.com/technologies/cookies?hl=es" rel="noopener">política de cookies de Google</a>.',
    ]),
    ("3. Fuentes tipográficas", [
        "Las tipografías del sitio se descargan de Google Fonts. No instalan cookies, pero Google recibe datos técnicos de conexión, como la IP, para entregarlas.",
    ]),
    ("4. WhatsApp e Instagram", [
        "Los botones de WhatsApp e Instagram son enlaces normales: no cargan nada de esos servicios hasta que los pulsas. A partir de ahí aplican sus propias políticas.",
    ]),
    ("5. Cómo controlarlas", [
        "Puedes borrar el almacenamiento y bloquear o borrar cookies desde la configuración de tu navegador; el sitio seguirá funcionando (si borras el almacenamiento, se vacía el carrito).",
    ]),
]

C_EN = [
    ("1. First-party cookies", [
        "La Capital del Cielo uses no first-party cookies, for analytics or advertising. It only stores these technical items in your browser, which do not identify you and never leave your device:",
        ("table", ["Name", "Purpose", "Duration"], [
            ["lcdc-lang (local storage)", "Remember the language you chose (Spanish or English).", "Until you delete it."],
            ["lcdc-carrito-v1 (local storage)", "Keep the shirts in your cart while you shop.", "Until you empty the cart or delete it."],
            ["lcdc-intro (session storage)", "Remember you already saw the intro animation so it does not repeat.", "Deleted when you close the tab."],
        ]),
    ]),
    ("2. Google Maps", [
        'Each home\'s page shows a Google Maps map. When it loads, Google may set its own cookies and receive technical data such as your IP. We have no access to those cookies. If you do not want them, you can block third-party cookies in your browser. More information in <a href="https://policies.google.com/technologies/cookies?hl=en" rel="noopener">Google\'s cookie policy</a>.',
    ]),
    ("3. Fonts", [
        "The site's fonts are downloaded from Google Fonts. They set no cookies, but Google receives technical connection data, such as your IP, to deliver them.",
    ]),
    ("4. WhatsApp and Instagram", [
        "The WhatsApp and Instagram buttons are plain links: nothing from those services loads until you tap them. From then on, their own policies apply.",
    ]),
    ("5. How to control them", [
        "You can clear storage and block or delete cookies in your browser settings; the site will keep working (clearing storage empties the cart).",
    ]),
]

DOCS = {
    "terms": {
        "es": {"title": "Términos y condiciones", "description": "Condiciones de uso del sitio de La Capital del Cielo, de las reservas de casas en Los Roques y de la compra de camisas.",
               "intro": ["Estos términos regulan el uso de este sitio web, las solicitudes y reservas de estadía en las casas de La Capital del Cielo en Los Roques, Venezuela, y la compra de camisas. Al usar el sitio, solicitar una reserva o hacer un pedido, aceptas estos términos."],
               "sections": T_ES},
        "en": {"title": "Terms and conditions", "description": "Terms of use of the La Capital del Cielo website, home bookings in Los Roques and shirt purchases.",
               "intro": ["These terms govern the use of this website, stay requests and bookings at La Capital del Cielo homes in Los Roques, Venezuela, and shirt purchases. By using the site, requesting a booking or placing an order, you accept these terms. The Spanish version prevails in case of discrepancy."],
               "sections": T_EN},
    },
    "privacy": {
        "es": {"title": "Política de privacidad", "description": "Qué datos trata La Capital del Cielo, para qué, con quién se comparten y cómo ejercer tus derechos.",
               "intro": ["Aquí te contamos qué datos tuyos usamos, para qué, cuánto tiempo los guardamos y cómo puedes pedir que los cambiemos o borremos."],
               "sections": P_ES},
        "en": {"title": "Privacy policy", "description": "What data La Capital del Cielo processes, why, who it is shared with and how to exercise your rights.",
               "intro": ["Here we explain what data of yours we use, why, how long we keep it and how you can ask us to change or delete it. The Spanish version prevails in case of discrepancy."],
               "sections": P_EN},
    },
    "cookies": {
        "es": {"title": "Política de cookies", "description": "La Capital del Cielo no usa cookies propias. Qué guarda tu navegador y qué cookies pueden poner los mapas de Google.",
               "intro": ["Las cookies son pequeños archivos que un sitio guarda en tu navegador. Esta página explica qué se guarda al visitar La Capital del Cielo."],
               "sections": C_ES},
        "en": {"title": "Cookie policy", "description": "La Capital del Cielo uses no first-party cookies. What your browser stores and which cookies Google maps may set.",
               "intro": ["Cookies are small files a website stores in your browser. This page explains what is stored when you visit La Capital del Cielo. The Spanish version prevails in case of discrepancy."],
               "sections": C_EN},
    },
}
