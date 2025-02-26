/* eslint-disable */
export const faqCategories = [
    
    {
        id   : '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        slug : 'problemas-equipos-computo',
        title: 'Problemas con Equipos de Cómputo',
    },
    {
        id   : '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        slug : 'conectividad-redes',
        title: 'Conectividad y Redes',
    },
    {
        id   : '3a4b5c6d-7e8f-9g0h-1i2j-k3l4m5n6o7p8',
        slug : 'correo-electronico-accesos',
        title: 'Correo Electrónico y Accesos',
    },
    {
        id   : '4a5b6c7d-8e9f-0g1h-2i3j-k4l5m6n7o8p9',
        slug : 'sistemas-aplicaciones-internas',
        title: 'Sistemas y Aplicaciones Internas',
    },
    {
        id   : '5a6b7c8d-9e0f-1g2h-3i4j-k5l6m7n8o9p0',
        slug : 'mantenimiento-seguridad-informatica',
        title: 'Mantenimiento y Seguridad Informática',
    },
    {
        id   : '6a7b8c9d-0e1f-2g3h-4i5j-k6l7m8n9o0p1',
        slug : 'gestion-equipos',
        title: 'Gestión de Equipos',
    },
];
export const faqs = [
    // Problemas con Equipos de Cómputo
    {
        id        : 'f65d517a-6f69-4c88-81f5-416f47405ce1',
        categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        question  : '¿Qué hago si mi computadora no enciende?',
        answer    : 'Verifica que el cable de alimentación esté bien conectado. Si la computadora sigue sin encender, intenta probar con otro enchufe o fuente de energía. Si el problema persiste, comunícate con el soporte técnico.'
    },
    {
        id        : '0fcece82-1691-4b98-a9b9-b63218f9deef',
        categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        question  : '¿Cómo solucionar un sistema operativo lento o que se congela?',
        answer    : 'Reinicia el equipo y cierra las aplicaciones que no estés utilizando. Asegúrate de que el disco duro no esté lleno y revisa si hay actualizaciones pendientes del sistema. Si el problema continúa, reporta el caso a soporte técnico.'
    },
    {
        id        : '2e6971cd-49d5-49f1-8cbd-fba5c71e6062',
        categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        question  : '¿Por qué mi impresora no responde o no imprime correctamente?',
        answer    : 'Verifica que la impresora esté encendida y conectada correctamente. Asegúrate de que el papel y la tinta/tóner sean los adecuados. Si sigue sin funcionar, intenta reinstalar los controladores o contacta a soporte.'
    },
    {
        id        : '974f93b8-336f-4eec-b011-9ddb412ee828',
        categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        question  : '¿Cómo solicitar la instalación de un software autorizado?',
        answer    : 'Debes enviar una solicitud formal al área de soporte técnico indicando el software requerido y la justificación. Solo se instalarán programas autorizados y compatibles con la infraestructura de la Alcaldía.'
    },
    {
        id        : '5d877fc7-b881-4527-a6aa-d39d642feb23',
        categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        question  : '¿Qué hacer si mi equipo se apaga inesperadamente?',
        answer    : 'Podría ser un problema de sobrecalentamiento o energía. Verifica si los ventiladores están funcionando y limpia las salidas de aire. Si el problema persiste, informa a soporte para una revisión.'
    },
    {
        id        : 'aa1f0f4d-6c9e-4f54-b391-f37f8d1e4d8a',
        categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        question  : '¿Cómo reportar un daño físico en mi equipo?',
        answer    : 'Debes notificarlo de inmediato al área de soporte con una descripción del daño y, si es posible, fotos del problema. Dependiendo del caso, se determinará si procede una reparación o reposición.'
    },
    {
        id        : 'bb2e1f5d-7d0f-5e65-c402-g48g9e2e5e9b',
        categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        question  : '¿Cómo solicitar un equipo nuevo o el reemplazo de uno dañado?',
        answer    : 'La solicitud debe realizarse a través de los canales oficiales de la Alcaldía. Es posible que se requiera la aprobación de un supervisor y la justificación del reemplazo.'
    },
    // Conectividad y Redes
    {
        id        : 'cc3f2f6d-8e1f-6f76-d513-h59h0f3f6f0c',
        categoryId: '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        question  : '¿Cómo restablecer la conexión a internet en mi oficina?',
        answer    : 'Revisa si otros dispositivos también tienen problemas. Si solo tu computadora está afectada, reinicia el equipo y verifica la conexión Wi-Fi o por cable. Si el problema continúa, contacta a soporte.'
    },
    {
        id        : 'dd4g3g7d-9f2g-7g87-e624-i60i1g4g7g1d',
        categoryId: '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        question  : '¿Qué hacer si no puedo acceder a la red interna de la Alcaldía?',
        answer    : 'Solicita una ip interna valida, y asegúrate de estar dentro de la red autorizada. Si el acceso sigue fallando, prueba reiniciar tu sesión o verifica que no haya bloqueos de seguridad en tu cuenta.'
    },
    {
        id        : 'ee5h4h8d-0g3h-8h98-f735-j71j2h5h8h2e',
        categoryId: '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        question  : '¿Cómo cambiar mi contraseña de acceso a la red?',
        answer    : 'Puedes cambiarla desde el portal de acceso interno o solicitando ayuda a soporte técnico. Se recomienda usar una contraseña segura y no compartirla con nadie.'
    },
    {
        id        : 'ff6i5i9d-1h4i-9i09-g846-k82k3i6i9i3f',
        categoryId: '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        question  : '¿A quién contactar si hay problemas con el servidor o VPN?',
        answer    : 'Los problemas relacionados con servidores y VPN deben ser reportados directamente al área de soporte de TI de la Alcaldía para su análisis y solución.'
    },
    {
        id        : 'gg7j6j0d-2i5j-0j10-h957-l93l4j7j0j4g',
        categoryId: '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        question  : '¿Por qué mi conexión a internet es lenta?',
        answer    : 'Puede deberse a una saturación en la red. Intenta cerrar aplicaciones que consuman ancho de banda y verifica si otros usuarios tienen el mismo problema. Si la lentitud persiste, informa a soporte.'
    },
    {
        id        : 'hh8k7k1d-3j6k-1k21-i068-m04m5k8k1k5h',
        categoryId: '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        question  : '¿Cómo conectar mi equipo a una impresora en red?',
        answer    : 'Solicita a soporte técnico la configuración de la impresora en tu equipo. Es posible que necesites permisos administrativos para agregar la impresora a la red.'
    },
    {
        id        : 'ii9l8l2d-4k7l-2l32-j179-n15n6l9l2l6i',
        categoryId: '2a3b4c5d-6e7f-8g9h-0i1j-k2l3m4n5o6p7',
        question  : '¿Qué hacer si mi conexión Wi-Fi se desconecta constantemente?',
        answer    : 'Verifica que la señal sea estable y que no haya interferencias. Si el problema persiste, prueba cambiar de punto de acceso o conéctate por cable.'
    },
    // Correo Electrónico y Accesos
    {
        id        : 'jj0m9m3d-5l8m-3m43-k280-o26o7m0m3m7j',
        categoryId: '3a4b5c6d-7e8f-9g0h-1i2j-k3l4m5n6o7p8',
        question  : '¿Cómo recuperar mi contraseña de correo o sistema interno?',
        answer    : 'Debes contactar a soporte técnico y proporcionar la información necesaria para la verificación de identidad.'
    },
    {
        id        : 'kk1n0n4d-6m9n-4n54-l391-p37p8n1n4n8k',
        categoryId: '3a4b5c6d-7e8f-9g0h-1i2j-k3l4m5n6o7p8',
        question  : '¿Cómo configurar el correo institucional en mi dispositivo móvil?',
        answer    : 'Puedes hacerlo a través de las configuraciones de correo del dispositivo, utilizando los datos de servidor SMTP y POP/IMAP proporcionados por soporte técnico.'
    },
    {
        id        : 'll2o1o5d-7n0o-5o65-m402-q48q9o2o5o9l',
        categoryId: '3a4b5c6d-7e8f-9g0h-1i2j-k3l4m5n6o7p8',
        question  : '¿Cómo reportar correos sospechosos o de phishing?',
        answer    : 'No abras ni descargues archivos de correos sospechosos. Reenvíalos a soporte para su análisis.'
    },
    {
        id        : 'mm3p2p6d-8o1p-6p76-n513-r59r0p3p6p0m',
        categoryId: '3a4b5c6d-7e8f-9g0h-1i2j-k3l4m5n6o7p8',
        question  : '¿Puedo acceder a mi correo desde fuera de la Alcaldía?',
        answer    : 'Sí, si el acceso externo está habilitado. Si tienes problemas, verifica con soporte si necesitas una VPN o configuración especial.'
    },
    {
        id        : 'nn4q3q7d-9p2q-7q87-o624-s60s1q4q7q1n',
        categoryId: '3a4b5c6d-7e8f-9g0h-1i2j-k3l4m5n6o7p8',
        question  : '¿Cómo agregar una firma institucional en el correo?',
        answer    : 'Puedes configurarla en la sección de firma dentro de la configuración del correo electrónico. Para obtener la firma oficial, consulta con el área de comunicaciones.'
    },
    // Sistemas y Aplicaciones Internas
    
    {
        id        : 'oo5r4r8d-0q3r-8r98-p735-t71t2r5r8r2o',
        categoryId: '4a5b6c7d-8e9f-0g1h-2i3j-k4l5m6n7o8p9',
        question  : '¿Cómo realizar respaldos de información importante?',
        answer    : 'Consulta con soporte sobre las políticas de respaldo. Se recomienda guardar archivos en servidores oficiales o en almacenamiento en la nube autorizado.'
    },
    {
        id        : 'pp6s5s9d-1r4s-9s09-q846-u82u3s6s9s3p',
        categoryId: '4a5b6c7d-8e9f-0g1h-2i3j-k4l5m6n7o8p9',
        question  : '¿Cómo recuperar datos eliminados accidentalmente?',
        answer    : 'Si los datos estaban en la red o en un servidor, es posible restaurarlos. Contacta a soporte técnico lo antes posible.'
    },
    {
        id        : 'qq7t6t0d-2s5t-0t10-r957-v93v4t7t0t4q',
        categoryId: '4a5b6c7d-8e9f-0g1h-2i3j-k4l5m6n7o8p9',
        question  : '¿A quién reportar fallos en los sistemas internos?',
        answer    : 'Debes reportarlos al área de TI mediante un ticket o correo electrónico especificando el problema.'
    },
    {
        id        : 'rr8u7u1d-3t6u-1u21-s068-w04w5u8u1u5r',
        categoryId: '4a5b6c7d-8e9f-0g1h-2i3j-k4l5m6n7o8p9',
        question  : '¿Cómo actualizar un sistema interno?',
        answer    : 'Las actualizaciones son gestionadas por el área de TI. No instales software sin autorización.'
    },
    {
        id        : 'ss9v8v2d-4u7v-2v32-t179-x15x6v9v2v6s',
        categoryId: '4a5b6c7d-8e9f-0g1h-2i3j-k4l5m6n7o8p9',
        question  : '¿Cómo solicitar capacitación sobre un sistema?',
        answer    : 'Consulta con el área de soporte o recursos humanos sobre cursos o manuales disponibles.'
    },
    {
        id        : 'tt0w9w3d-5v8w-3w43-u280-y26y7w0w3w7t',
        categoryId: '5a6b7c8d-9e0f-1g2h-3i4j-k5l6m7n8o9p0',
        question  : '¿Qué hacer si sospecho que mi equipo tiene un virus?',
        answer    : 'Desconéctalo de la red y reporta el problema a soporte.'
    },
    {
        id        : 'uu1x0x4d-6w9x-4x54-v391-z37z8x1x4x8u',
        categoryId: '5a6b7c8d-9e0f-1g2h-3i4j-k5l6m7n8o9p0',
        question  : '¿Cómo reportar la pérdida o daño de un equipo?',
        answer    : 'Debes informar inmediatamente a tu supervisor y al área de soporte técnico.'
    },
    {
        id        : 'vv2y1y5d-7x0y-5y65-w402-a48a9y2y5y9v',
        categoryId: '5a6b7c8d-9e0f-1g2h-3i4j-k5l6m7n8o9p0',
        question  : '¿Es obligatorio usar un antivirus?',
        answer    : 'Sí, todos los equipos deben tener un antivirus institucional instalado y actualizado.'
    },
    {
        id        : 'ww3z2z6d-8y1z-6z76-x513-b59b0z3z6z0w',
        categoryId: '5a6b7c8d-9e0f-1g2h-3i4j-k5l6m7n8o9p0',
        question  : '¿Qué hacer si mi cuenta de usuario ha sido bloqueada?',
        answer    : 'Solicita el restablecimiento a soporte, indicando tu nombre y área.'
    },
    {
        id        : 'xx4a3a7d-9z2a-7a87-y624-c60c1a4a7a1x',
        categoryId: '5a6b7c8d-9e0f-1g2h-3i4j-k5l6m7n8o9p0',
        question  : '¿Puedo instalar software por mi cuenta?',
        answer    : 'No, toda instalación debe ser autorizada por TI.'
    },
    {
        id        : 'yy5b4b8d-0a3b-8b98-z735-d71d2b5b8b2y',
        categoryId: '6a7b8c9d-0e1f-2g3h-4i5j-k6l7m8n9o0p1',
        question  : '¿Cómo solicitar el reemplazo de un equipo dañado?',
        answer    : 'Si un equipo presenta fallas irreparables, se debe reportar a soporte técnico con un informe detallado del problema. Si el daño es crítico, se gestionará la reposición conforme a los procedimientos de la Alcaldía.'
    },
    {
        id        : 'zz6c5c9d-1b4c-9c09-a846-e82e3c6c9c3z',
        categoryId: '6a7b8c9d-0e1f-2g3h-4i5j-k6l7m8n9o0p1',
        question  : '¿Qué hacer si un equipo asignado se pierde o es robado?',
        answer    : 'Debes informar de inmediato a tu supervisor y al área de TI. Dependiendo del caso, también puede ser necesario presentar un informe ante las autoridades correspondientes.'
    },
    {
        id        : 'aa7d6d0d-2c5d-0d10-b957-f93f4d7d0d4a',
        categoryId: '6a7b8c9d-0e1f-2g3h-4i5j-k6l7m8n9o0p1',
        question  : '¿Quién es responsable del mantenimiento de los equipos asignados?',
        answer    : 'El usuario asignado es responsable del uso adecuado del equipo, pero el mantenimiento preventivo y correctivo es gestionado por el área de TI.'
    },
    {
        id        : 'bb8e7e1d-3d6e-1e21-c068-g04g5e8e1e5b',
        categoryId: '6a7b8c9d-0e1f-2g3h-4i5j-k6l7m8n9o0p1',
        question  : '¿Qué hacer si necesito trasladar un equipo a otra oficina o dependencia?',
        answer    : 'El traslado de equipos debe ser autorizado por el área de TI. Se debe solicitar formalmente y coordinar con soporte técnico para garantizar la correcta instalación en la nueva ubicación.'
    },
    {
        id        : 'cc9f8f2d-4e7f-2f32-d179-h15h6f9f2f6c',
        categoryId: '6a7b8c9d-0e1f-2g3h-4i5j-k6l7m8n9o0p1',
        question  : '¿Cómo se reasignan los equipos cuando un funcionario cambia de área o deja la Alcaldía?',
        answer    : 'Cuando un funcionario cambia de puesto o deja la institución, el equipo debe ser devuelto al área de TI para su evaluación y posible reasignación. Es responsabilidad del usuario y su supervisor garantizar esta entrega.'
    }
];
export const guideCategories = [
    {
        id   : '0ee72de7-49c0-4880-9e89-b72a4edd6a81',
        slug : 'introduccion',
        title: 'Introducción al Soporte Técnico',
    },
    {
        id   : '07b8421f-20bf-45b6-90ee-169ebe3a5bcc',
        slug : 'servicios',
        title: 'Servicios de TI',
    },
    {
        id   : 'c88a1f54-360a-4b9b-a54b-2f92b7a1f63b',
        slug : 'politicas',
        title: 'Políticas y Procedimientos',
    },
    {
        id   : '7b25b38c-1ab3-4474-8569-65b3ea232add',
        slug : 'solicitudes',
        title: 'Solicitudes de Servicio',
    },
    {
        id   : '41fdf071-aec4-49de-9dd4-b4f746596928',
        slug : 'contacto',
        title: 'Contacto y Horarios',
    },
];
export const guides = [
    // Introducción
    {
        id        : 'a008ffa3-7b3f-43be-8a8f-dbf5272ed2dd',
        categoryId: '0ee72de7-49c0-4880-9e89-b72a4edd6a81',
        slug      : 'bienvenida-soporte',
        title     : 'Bienvenido al Soporte Técnico',
        subtitle  : 'Conoce nuestro equipo y los servicios que ofrecemos para mantener tu trabajo sin interrupciones',
        content   : 'El departamento de soporte técnico está aquí para ayudarte con todas tus necesidades tecnológicas, brindando un apoyo integral que abarca desde la resolución de problemas hasta la optimización del rendimiento de tus dispositivos. Nuestro equipo está compuesto por profesionales altamente capacitados y con amplia experiencia en el campo, quienes se dedican a resolver cualquier inconveniente que puedas tener con tu equipo o software, sin importar su complejidad. Nos esforzamos por ofrecer un servicio rápido y eficiente, asegurando que tu experiencia laboral sea lo más fluida posible y que puedas concentrarte en tus tareas sin interrupciones. Además, estamos comprometidos con la formación continua, participando en cursos y capacitaciones para mantenernos al día con las últimas tecnologías y tendencias del sector. Esto nos permite no solo resolver problemas, sino también anticiparnos a ellos, ofreciendo soluciones proactivas que mejoren tu productividad y la de tu equipo. Nuestro objetivo es convertirnos en un aliado estratégico en tu día a día, garantizando que cada interacción con nuestro servicio sea satisfactoria y que siempre encuentres en nosotros el apoyo que necesitas para superar cualquier desafío tecnológico que se presente.',
    },
    {
        id        : '7643d388-12ab-4025-a2f1-5045ac7b1c4c',
        categoryId: '0ee72de7-49c0-4880-9e89-b72a4edd6a81',
        slug      : 'como-solicitar-ayuda',
        title     : 'Cómo solicitar ayuda técnica',
        subtitle  : 'Guía paso a paso para reportar problemas y solicitar asistencia técnica',
        content   : 'Para solicitar ayuda, puedes contactarnos a través de los siguientes canales: correo electrónico, teléfono o nuestro sistema de tickets en línea. Es importante que proporciones la mayor cantidad de información posible sobre el problema que estás experimentando, incluyendo capturas de pantalla si es necesario. Esto nos permitirá diagnosticar y resolver tu problema de manera más eficiente. Recuerda que estamos aquí para ayudarte y que tu satisfacción es nuestra prioridad.',
    },

    // Servicios
    {
        id        : '3c876ea6-7e7c-4a3e-a6e8-7ec06a8b2b68',
        categoryId: '07b8421f-20bf-45b6-90ee-169ebe3a5bcc',
        slug      : 'servicios-disponibles',
        title     : 'Servicios Disponibles',
        subtitle  : 'Conoce todos los servicios que ofrece el departamento de TI',
        content   : 'Nuestros servicios abarcan una amplia gama de soluciones, incluyendo soporte técnico especializado, mantenimiento preventivo y correctivo de equipos, gestión integral de redes y robustas medidas de seguridad informática. Nos comprometemos a mantener todos los equipos en condiciones óptimas, asegurando que estén actualizados con las últimas versiones de software y parches de seguridad. Además, ofrecemos programas de capacitación a los usuarios, diseñados para maximizar el uso de las herramientas tecnológicas disponibles y fomentar un ambiente de trabajo productivo. Nuestro objetivo es garantizar que todos los empleados tengan acceso a un entorno de trabajo eficiente, seguro y adaptado a sus necesidades, permitiéndoles concentrarse en sus tareas sin interrupciones ni preocupaciones tecnológicas.',
    },
    // Políticas
    {
        id        : '5c876ea6-7e7c-4a3e-a6e8-7ec06a8b2b68',
        categoryId: 'c88a1f54-360a-4b9b-a54b-2f92b7a1f63b',
        slug      : 'politicas-uso',
        title     : 'Políticas de Uso de Equipos',
        subtitle  : 'Lineamientos y normas para el uso correcto de los equipos institucionales',
        content   : 'Es fundamental seguir las siguientes políticas para el uso adecuado de los equipos: todos los usuarios deben asegurarse de utilizar los equipos de manera responsable y en conformidad con las normativas establecidas por la institución. Esto incluye, pero no se limita a, no instalar software no autorizado, así como mantener la seguridad de la información en todo momento. Además, se espera que los usuarios informen de inmediato cualquier problema o mal funcionamiento que experimenten, con el fin de evitar daños mayores o interrupciones en el servicio. El incumplimiento de estas políticas puede resultar en sanciones que van desde advertencias formales hasta la revocación del acceso a los equipos, lo cual podría afectar la capacidad de los usuarios para realizar sus tareas diarias de manera eficiente. Por lo tanto, es crucial que todos los empleados comprendan y respeten estas directrices para garantizar un entorno de trabajo seguro y productivo.',
    },
    // Solicitudes
    {
        id        : '7c876ea6-7e7c-4a3e-a6e8-7ec06a8b2b68',
        categoryId: '7b25b38c-1ab3-4474-8569-65b3ea232add',
        slug      : 'proceso-solicitudes',
        title     : 'Proceso de Solicitudes',
        subtitle  : 'Aprende cómo realizar solicitudes de equipos y servicios',
        content   : 'Para realizar una solicitud, sigue estos pasos detallados: primero, completa el formulario de solicitud que encontrarás disponible en nuestro portal. Es crucial que incluyas todos los detalles necesarios, como el tipo de equipo o servicio que requieres, así como una justificación clara y concisa de la solicitud. Una vez que hayas enviado tu solicitud, esta será revisada minuciosamente por el equipo de TI, quienes se pondrán en contacto contigo para confirmar la recepción de la misma y proporcionarte un plazo estimado para la atención. Es importante recordar que realizar las solicitudes con anticipación es fundamental para garantizar que podamos atender tus necesidades de manera oportuna y eficiente, evitando así cualquier inconveniente que pueda surgir por falta de tiempo.',
    },

    // Contacto
    {
        id        : '9c876ea6-7e7c-4a3e-a6e8-7ec06a8b2b68',
        categoryId: '41fdf071-aec4-49de-9dd4-b4f746596928',
        slug      : 'informacion-contacto',
        title     : 'Información de Contacto',
        subtitle  : 'Horarios de atención y medios de contacto',
        content   : 'Estamos disponibles en los siguientes horarios: de lunes a viernes de 8:00 a 12:00 y 14:30 a 18:30 horas. Puedes contactarnos a través de nuestro correo electrónico, número de teléfono o visitando nuestras oficinas. Además, contamos con un sistema de tickets en línea que te permite realizar consultas y seguimiento a tus solicitudes de manera eficiente. Nuestro equipo está siempre dispuesto a ayudarte y resolver cualquier duda que puedas tener, así que no dudes en ponerte en contacto con nosotros.',
    },

    // Más temas para Introducción
    {
        id        : 'i8901234-56ab-cdef-7890-123456abcdef',
        categoryId: '0ee72de7-49c0-4880-9e89-b72a4edd6a81',
        slug      : 'estructura-departamento',
        title     : 'Estructura del Departamento TI',
        subtitle  : 'Conoce cómo está organizado nuestro equipo',
        content   : 'El departamento de TI está estructurado en diferentes áreas especializadas: soporte técnico, redes, seguridad y desarrollo. Cada una de estas áreas juega un papel crucial en el funcionamiento general de la infraestructura tecnológica de la organización. El equipo de soporte técnico se encarga de resolver problemas cotidianos que los usuarios puedan enfrentar, asegurando que todos los sistemas funcionen sin inconvenientes. Por otro lado, el área de redes se ocupa de la conectividad y el mantenimiento de la infraestructura de red, garantizando que todos los dispositivos estén interconectados de manera eficiente y segura. La seguridad es otra área fundamental, ya que se encarga de proteger la información y los sistemas de la organización contra amenazas externas e internas, implementando políticas y herramientas de seguridad robustas. Finalmente, el equipo de desarrollo se dedica a crear y mantener aplicaciones y sistemas que faciliten el trabajo diario de los empleados, adaptándose a las necesidades cambiantes de la organización y mejorando continuamente la eficiencia operativa.',
    },
    {
        id        : 'j9012345-67ab-cdef-8901-234567abcdef',
        categoryId: '0ee72de7-49c0-4880-9e89-b72a4edd6a81',
        slug      : 'prioridades-atencion',
        title     : 'Prioridades de Atención',
        subtitle  : 'Entiende cómo se priorizan las solicitudes',
        content   : 'Las solicitudes se clasifican según su impacto y urgencia en cuatro categorías principales: críticas, altas, medias y bajas. Las solicitudes críticas son aquellas que requieren atención inmediata, ya que su resolución es esencial para el funcionamiento continuo de los servicios. Por otro lado, las solicitudes altas son importantes, pero pueden esperar un poco más sin causar un impacto significativo en las operaciones. Las solicitudes medias son aquellas que, aunque son relevantes, no afectan de manera inmediata el rendimiento del trabajo diario y pueden ser atendidas en un plazo razonable. Finalmente, las solicitudes bajas son las que tienen el menor impacto y pueden ser programadas para su atención en un futuro cercano, permitiendo así una gestión eficiente de los recursos y el tiempo del equipo de soporte.',
    },
    {
        id        : 'k0123456-78ab-cdef-9012-345678abcdef',
        categoryId: '0ee72de7-49c0-4880-9e89-b72a4edd6a81',
        slug      : 'herramientas-disponibles',
        title     : 'Herramientas de Soporte',
        subtitle  : 'Conoce las herramientas que utilizamos',
        content   : 'Contamos con diversas herramientas especializadas que han sido diseñadas para brindarte el mejor soporte posible en todas tus necesidades tecnológicas. Estas herramientas incluyen software de gestión de incidencias, plataformas de comunicación en tiempo real, y sistemas de monitoreo que nos permiten identificar y resolver problemas de manera proactiva. Además, nuestro equipo de soporte está capacitado para utilizar estas herramientas de manera eficiente, asegurando que cada solicitud sea atendida con la mayor rapidez y eficacia. Nuestro objetivo es garantizar que tengas acceso a los recursos necesarios para realizar tu trabajo sin contratiempos, y estamos comprometidos a mejorar continuamente nuestras capacidades para ofrecerte un servicio excepcional.',
    },

    // Más temas para Servicios
    {
        id        : 'l1234567-89ab-cdef-0123-456789abcdef',
        categoryId: '07b8421f-20bf-45b6-90ee-169ebe3a5bcc',
        slug      : 'gestion-licencias',
        title     : 'Gestión de Licencias',
        subtitle  : 'Administración de software y licencias',
        content   : 'Gestionamos todas las licencias de software utilizadas en la institución...',
        
    },
    {
        id        : 'm2345678-90ab-cdef-1234-567890abcdef',
        categoryId: '07b8421f-20bf-45b6-90ee-169ebe3a5bcc',
        slug      : 'capacitacion-usuarios',
        title     : 'Capacitación de Usuarios',
        subtitle  : 'Programas de formación disponibles',
        content   : 'Gestionamos todas las licencias de software utilizadas en la institución, asegurando que cada aplicación y herramienta cumpla con las normativas legales y de uso. Nuestro equipo se encarga de realizar un seguimiento constante de las licencias, renovándolas cuando es necesario y evaluando el uso de cada software para optimizar los recursos. Además, proporcionamos informes periódicos sobre el estado de las licencias, lo que permite a la administración tomar decisiones informadas sobre futuras adquisiciones y actualizaciones. También ofrecemos asesoramiento a los usuarios sobre el uso adecuado de las herramientas, garantizando que todos estén al tanto de las políticas de uso y las mejores prácticas para maximizar la eficiencia y la seguridad en el entorno de trabajo.',
    },
    {
        id        : 'n3456789-01ab-cdef-2345-678901abcdef',
        categoryId: '07b8421f-20bf-45b6-90ee-169ebe3a5bcc',
        slug      : 'servicios-especiales',
        title     : 'Servicios Especiales',
        subtitle  : 'Servicios adicionales bajo demanda',
        content   : 'Además de nuestros servicios regulares, ofrecemos una amplia gama de servicios especializados que están diseñados para satisfacer las necesidades específicas de nuestros usuarios. Estos servicios incluyen asesoramiento personalizado, soporte técnico avanzado, y soluciones a medida que se adaptan a los requerimientos particulares de cada cliente. Nuestro objetivo es garantizar que cada usuario reciba la atención y el soporte que necesita, permitiéndole así maximizar el uso de nuestras herramientas y recursos. Nos comprometemos a trabajar de la mano con nuestros usuarios para entender sus desafíos y ofrecerles las mejores soluciones posibles, asegurando una experiencia óptima y satisfactoria en el uso de nuestros servicios.',
       
    },

    // Más temas para Políticas
    {
        id        : 'o4567890-12ab-cdef-3456-789012abcdef',
        categoryId: 'c88a1f54-360a-4b9b-a54b-2f92b7a1f63b',
        slug      : 'seguridad-informacion',
        title     : 'Seguridad de la Información',
        subtitle  : 'Políticas de protección de datos',
        content   : 'Nuestras políticas de seguridad están diseñadas para proteger la información sensible de nuestros usuarios y garantizar la confidencialidad, integridad y disponibilidad de los datos. Estas políticas establecen directrices claras sobre el manejo de la información, el acceso a los sistemas y la respuesta ante incidentes de seguridad. Además, se implementan medidas de seguridad física y lógica para prevenir accesos no autorizados y asegurar que la información se almacene y transmita de manera segura. Es fundamental que todos los empleados y colaboradores estén informados y capacitados sobre estas políticas, ya que su cumplimiento es esencial para mantener la confianza de nuestros usuarios y la reputación de nuestra institución. La seguridad de la información es una responsabilidad compartida, y todos debemos contribuir a crear un entorno seguro y protegido.',
    },
    {
        id        : 'p5678901-23ab-cdef-4567-890123abcdef',
        categoryId: 'c88a1f54-360a-4b9b-a54b-2f92b7a1f63b',
        slug      : 'uso-internet',
        title     : 'Políticas de Uso de Internet',
        subtitle  : 'Normas para el uso de internet institucional',
        content   : 'El uso de internet está regulado para garantizar la seguridad y productividad de todos los usuarios dentro de la institución. Se espera que cada empleado y colaborador utilice la red de manera responsable, evitando actividades que puedan comprometer la integridad de los sistemas o la confidencialidad de la información. Además, se prohíbe el acceso a sitios web que no estén relacionados con las actividades laborales, así como la descarga de contenido no autorizado. El incumplimiento de estas normas puede resultar en sanciones disciplinarias, por lo que es fundamental que todos estén al tanto de las políticas establecidas y actúen en consecuencia para mantener un entorno de trabajo seguro y eficiente.',
    },
    {
        id        : 'q6789012-34ab-cdef-5678-901234abcdef',
        categoryId: 'c88a1f54-360a-4b9b-a54b-2f92b7a1f63b',
        slug      : 'byod',
        title     : 'Política BYOD',
        subtitle  : 'Uso de dispositivos personales',
        content   : 'Las normas para el uso de dispositivos personales en la red institucional son fundamentales para garantizar la seguridad y el correcto funcionamiento de la infraestructura tecnológica. Se espera que todos los empleados y colaboradores que deseen utilizar sus dispositivos personales, como teléfonos móviles, tabletas o computadoras portátiles, se adhieran a las políticas establecidas. Estas políticas incluyen la obligación de instalar software de seguridad, como antivirus y firewalls, y de mantener el sistema operativo y las aplicaciones actualizadas. Además, se prohíbe el acceso a información sensible o confidencial desde dispositivos no autorizados. Es esencial que los usuarios comprendan que el uso de dispositivos personales en la red institucional debe realizarse de manera responsable y ética, evitando cualquier actividad que pueda comprometer la seguridad de la información o la integridad de los sistemas. La violación de estas normas puede resultar en sanciones disciplinarias, por lo que es crucial que todos estén informados y cumplan con las directrices establecidas.',
    },

    // Más temas para Solicitudes
    {
        id        : 'r7890123-45ab-cdef-6789-012345abcdef',
        categoryId: '7b25b38c-1ab3-4474-8569-65b3ea232add',
        slug      : 'solicitud-equipos',
        title     : 'Solicitud de Equipos Nuevos',
        subtitle  : 'Proceso para solicitar nuevos equipos',
        content   : 'El proceso para solicitar nuevos equipos incluye varios pasos importantes que deben seguirse cuidadosamente para asegurar que la solicitud sea procesada de manera eficiente. Primero, es necesario completar un formulario de solicitud que incluya detalles específicos sobre el equipo requerido, como el tipo, la cantidad y el propósito de uso. Una vez que el formulario esté completo, debe ser enviado al departamento correspondiente para su revisión. Después de la revisión inicial, el departamento evaluará la necesidad del equipo solicitado y verificará si hay presupuesto disponible para la adquisición. Si la solicitud es aprobada, se procederá a realizar la compra del equipo y se notificará al solicitante sobre el estado de su solicitud. Es importante tener en cuenta que este proceso puede tardar varios días, por lo que se recomienda planificar con anticipación y presentar la solicitud lo antes posible.',
        
    },
    {
        id        : 's8901234-56ab-cdef-7890-123456abcdef',
        categoryId: '7b25b38c-1ab3-4474-8569-65b3ea232add',
        slug      : 'solicitud-software',
        title     : 'Solicitud de Software',
        subtitle  : 'Cómo solicitar nuevo software',
        content   : 'Para solicitar la instalación de nuevo software, debes seguir estos pasos: primero, asegúrate de tener la autorización necesaria de tu supervisor o del departamento correspondiente. Luego, completa el formulario de solicitud de software, proporcionando detalles como el nombre del software, la versión requerida y el propósito de su uso. Una vez que hayas enviado el formulario, el departamento de TI revisará tu solicitud y verificará si el software es compatible con los sistemas existentes. Si se aprueba, se programará la instalación en un plazo razonable. Recuerda que es importante justificar la necesidad del software y estar preparado para cualquier consulta adicional que el equipo de TI pueda tener.',
    },
    {
        id        : 't9012345-67ab-cdef-8901-234567abcdef',
        categoryId: '7b25b38c-1ab3-4474-8569-65b3ea232add',
        slug      : 'solicitud-accesos',
        title     : 'Solicitud de Accesos',
        subtitle  : 'Gestión de permisos y accesos',
        content   : 'Los accesos a sistemas y recursos se solicitan mediante el siguiente proceso: primero, el solicitante debe completar un formulario de solicitud que incluya información detallada sobre el acceso requerido, como el tipo de sistema o recurso, la justificación del acceso y la duración necesaria. Una vez que el formulario esté completo, debe ser enviado al supervisor correspondiente para su revisión. El supervisor evaluará la solicitud y, si es aprobada, la enviará al departamento de TI para su procesamiento. El departamento de TI revisará la solicitud y verificará si el solicitante tiene los permisos necesarios para acceder a los sistemas o recursos solicitados. Si todo está en orden, se procederá a otorgar el acceso y se notificará al solicitante sobre el estado de su solicitud. Es importante tener en cuenta que el incumplimiento de las políticas de acceso puede resultar en la revocación de los permisos y posibles sanciones disciplinarias.',
    }
];

// Since we only have one content for the demo, we will
// use the following mock-api on every request for every guide.
export const guideContent = `
<h2>Header Level 2</h2>

<p>
    <strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit
    amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper
    pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci,
    sagittis tempus lacus enim ac dui. <a href="#"
                                          class="link">Donec non enim</a>
    in turpis pulvinar facilisis. Ut felis.
</p>

<p>
    Orci varius natoque penatibus et magnis dis <em>parturient montes</em>, nascetur ridiculus mus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
    himenaeos. Curabitur vitae sagittis odio. <mark>Suspendisse</mark> ullamcorper nunc non pellentesque laoreet. Curabitur eu tortor id quam pretium mattis. Proin ut quam velit.
</p>

<h3>Header Level 3</h3>

<img src="assets/images/pages/help-center/image-1.jpg">
<p class="text-secondary">
    <em>Nullam sagittis nulla in diam finibus, sed pharetra velit vestibulum. Suspendisse euismod in urna eu posuere.</em>
</p>

<h4>Header Level 4</h4>

<blockquote>
    <p>
        Blockquote. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur
        massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.
    </p>
    <footer>
        Brian Hughes
    </footer>
</blockquote>

<ol>
    <li>Ordered list</li>
    <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
    <li>Aliquam tincidunt mauris eu risus.</li>
</ol>

<h5>Header Level 5</h5>

<ul>
    <li>Unordered list</li>
    <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
    <li>Aliquam tincidunt mauris eu risus.</li>
</ul>

<pre><code>#header h1 a {
    display: block;
    width: 300px;
    height: 80px;
}</code></pre>

<h6>Header Level 6</h6>

<dl>
    <dt>Definition list</dt>
    <dd>
        Quisque sit amet risus enim. Aliquam sit amet interdum justo, at ultricies sapien. Suspendisse et semper urna, in gravida eros. Quisque id nibh iaculis, euismod urna sed,
        egestas nisi. Donec eros metus, congue a imperdiet feugiat, sagittis nec ipsum. Quisque dapibus mollis felis non tristique.
    </dd>

    <dt>Definition list</dt>
    <dd>
        Ut auctor, metus sed dapibus tempus, urna diam auctor odio, in malesuada odio risus vitae nisi. Etiam blandit ante urna, vitae placerat massa mollis in. Duis nec urna ac
        purus semper dictum ut eget justo. Aenean non sagittis augue. Sed venenatis rhoncus enim eget ornare. Donec viverra sed felis at venenatis. Mauris aliquam fringilla nulla,
        sit amet congue felis dignissim at.
    </dd>
</dl>`;

