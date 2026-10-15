/**
 * Buying guides shown under category listings. General technical knowledge
 * only — nothing here makes claims about Imprelapp's stock or policies.
 */

export interface CategoryGuide {
  title: string
  intro: string
  sections: Array<{ heading: string; body: string[] }>
  faqs: Array<{ q: string; a: string }>
}

export const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  rodamientos: {
    title: 'Guía para elegir rodamientos y chumaceras',
    intro:
      'La referencia grabada en el aro de un rodamiento indica su tipo, su serie y sus medidas. Con ella puedes encontrar el reemplazo exacto sin desmontar ni medir la pieza.',
    sections: [
      {
        heading: 'Cómo leer la referencia de un rodamiento',
        body: [
          'En un rodamiento rígido de bolas como el 6203, el primer dígito (6) indica el tipo, el segundo (2) la serie de dimensiones y los dos últimos (03) el diámetro interior.',
          'Los códigos de diámetro 00, 01, 02 y 03 equivalen a 10, 12, 15 y 17 mm. Desde 04 en adelante se multiplica por 5: 04 = 20 mm, 05 = 25 mm, 06 = 30 mm.',
          'Para un mismo diámetro interior, la serie 60 es la más delgada, seguida de la 62, la 63 y la 64, que es la más robusta y soporta más carga.',
        ],
      },
      {
        heading: 'Sufijos más comunes',
        body: [
          '2RS: sellos de caucho en ambos lados, protegen contra polvo y humedad. ZZ (o 2Z): blindajes metálicos en ambos lados, menor fricción pero menos herméticos.',
          'C3: holgura interna mayor que la normal, indicada cuando el rodamiento trabaja caliente o con ajustes apretados. NR: ranura en el aro exterior con anillo de retención.',
        ],
      },
      {
        heading: 'Chumaceras UCP, UCF y UCFL',
        body: [
          'Una chumacera es un rodamiento de inserto (UC) montado en un soporte de fundición. UCP es de tipo puente con dos pernos, UCF es brida cuadrada de cuatro pernos y UCFL es brida ovalada de dos pernos.',
          'El número del inserto indica el eje: UC205 es para eje de 25 mm. Cuando lleva un sufijo como -16, el eje está en pulgadas medido en dieciseisavos: 205-16 corresponde a eje de 1".',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué diferencia hay entre un rodamiento 2RS y uno ZZ?',
        a: 'El 2RS tiene sellos de caucho en ambos lados y protege mejor contra polvo y agua. El ZZ tiene blindajes metálicos: genera menos fricción y admite algo más de velocidad, pero es menos hermético.',
      },
      {
        q: '¿Qué significa C3 en un rodamiento?',
        a: 'C3 indica una holgura interna mayor que la normal. Se usa cuando el rodamiento trabaja a temperatura alta o se monta con ajuste apretado, para que no se trabe al dilatarse.',
      },
      {
        q: '¿Cómo sé qué rodamiento necesito si la referencia está borrada?',
        a: 'Mide el diámetro interior, el diámetro exterior y el ancho en milímetros. Con esas tres medidas se identifica la referencia estándar. También puedes enviarnos una foto por WhatsApp y te ayudamos.',
      },
    ],
  },

  'ferreteria-en-general': {
    title: 'Guía de correas en V y poleas',
    intro:
      'Las correas en V clásicas se identifican con una letra (la sección) y un número (la longitud nominal en pulgadas). La correa y la polea deben tener la misma sección para transmitir potencia sin patinar.',
    sections: [
      {
        heading: 'Cómo leer la referencia de una correa',
        body: [
          'En una correa A45, la letra A es la sección y 45 la longitud nominal en pulgadas (unos 114 cm).',
          'Las secciones clásicas más usadas son A (unos 13 mm de ancho superior), B (unos 17 mm) y C (unos 22 mm). A mayor sección, más potencia puede transmitir la correa.',
        ],
      },
      {
        heading: 'Cómo elegir la polea',
        body: [
          'El canal de la polea debe corresponder a la sección de la correa: canal A para correas A y canal B para correas B.',
          'Revisa también el diámetro de la polea, el número de canales y el diámetro del eje donde se va a montar.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Puedo usar una correa A en una polea de canal B?',
        a: 'No es recomendable. La correa A queda hundida en el canal B, pierde agarre, patina y se desgasta rápido. Usa siempre la misma sección en correa y polea.',
      },
      {
        q: '¿Cómo sé qué correa necesito?',
        a: 'Busca la referencia impresa en el lomo de la correa usada, por ejemplo B58. Si está borrada, envíanos la medida del perímetro y el ancho por WhatsApp y te ayudamos a identificarla.',
      },
      {
        q: '¿Cada cuánto se cambia una correa en V?',
        a: 'Cámbiala cuando tenga grietas, bordes deshilachados, brillo en los costados o cuando patine aunque esté bien tensionada. En transmisiones con varias correas se recomienda cambiar el juego completo.',
      },
    ],
  },

  'herramientas-manuales': {
    title: 'Guía de llaves y copas',
    intro:
      'Para elegir llaves y copas hay que conocer la medida de la tuerca o el tornillo, si es métrica o en pulgadas, y el tamaño del cuadrante de la herramienta de mando.',
    sections: [
      {
        heading: 'Llaves mixtas',
        body: [
          'La llave mixta tiene boca fija en un extremo y estrella en el otro, ambos de la misma medida. La estrella abraza la tuerca y reduce el riesgo de redondearla.',
        ],
      },
      {
        heading: 'Copas y cuadrantes',
        body: [
          'El cuadrante es la conexión cuadrada entre la copa y el rachet o maneral. Los tamaños comunes son 1/4", 3/8", 1/2" y 3/4". A mayor cuadrante, más torque admite la herramienta.',
          'Las copas largas alcanzan tuercas montadas en espárragos o pernos largos. Las copas de impacto suelen tener acabado negro y están diseñadas para pistolas de impacto. Las cromadas son para uso manual.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué significa copa cuadrante 1/2?',
        a: 'Que la conexión cuadrada para el rachet o maneral mide 1/2 de pulgada. La medida de la tuerca que ajusta la copa, por ejemplo 13 mm, se indica aparte.',
      },
      {
        q: '¿Puedo usar copas cromadas con una pistola de impacto?',
        a: 'No es recomendable. Las copas cromadas son para uso manual y pueden fisurarse con los golpes de una pistola de impacto. Para ese uso se deben emplear copas de impacto.',
      },
    ],
  },

  'herramientas-electricas': {
    title: 'Guía para elegir herramientas eléctricas',
    intro:
      'Antes de comprar una herramienta eléctrica revisa su voltaje, su potencia y el tipo de trabajo que vas a hacer.',
    sections: [
      {
        heading: 'Voltaje y potencia',
        body: [
          'En Colombia la red doméstica es de 110-120 V a 60 Hz, así que las herramientas deben indicar 110 V o 120 V. La potencia, en vatios (W), da una idea de la capacidad de trabajo continuo.',
        ],
      },
      {
        heading: 'Taladro, taladro percutor o rotomartillo',
        body: [
          'El taladro sirve para perforar madera, metal y plástico. El taladro percutor añade una función de percusión para ladrillo y bloque. Para concreto de forma frecuente se recomienda un rotomartillo.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué voltaje debe tener una herramienta para usarla en Colombia?',
        a: 'Debe ser de 110 V o 120 V, que es el voltaje de la red doméstica colombiana. Las herramientas de 220 V solo funcionan con una conexión trifásica o bifásica adecuada.',
      },
      {
        q: '¿Un taladro percutor sirve para concreto?',
        a: 'Sirve para perforaciones ocasionales en ladrillo y bloque, y para concreto liviano. Para perforar concreto con frecuencia es mejor un rotomartillo.',
      },
    ],
  },

  'carretillas-y-equipos': {
    title: 'Guía de gatos, torres de bloqueo y equipo de carga',
    intro:
      'Para levantar un vehículo o una carga con seguridad se combinan un gato, que eleva, y torres de bloqueo, que sostienen el peso mientras trabajas.',
    sections: [
      {
        heading: 'Capacidad',
        body: [
          'La capacidad de gatos y torres se indica en toneladas. Elige siempre una capacidad mayor que el peso que vas a soportar. Las torres se usan en pares, y la capacidad indicada suele ser la del par.',
        ],
      },
      {
        heading: 'Uso seguro',
        body: [
          'Nunca trabajes debajo de un vehículo sostenido solo por un gato. Después de levantarlo, apóyalo sobre torres de bloqueo en los puntos indicados por el fabricante y en un piso firme y nivelado.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Para qué sirven las torres de bloqueo?',
        a: 'Sostienen el vehículo de forma estable después de levantarlo con el gato. El gato hidráulico puede perder presión, por eso nunca se debe trabajar debajo de un vehículo apoyado solo en él.',
      },
      {
        q: '¿Qué capacidad de gato necesito?',
        a: 'Una capacidad mayor que el peso que vas a levantar, con margen de seguridad. Revisa el peso del vehículo o la carga en su ficha técnica antes de elegir.',
      },
    ],
  },

  cadenas: {
    title: 'Guía de cadenas de transmisión',
    intro:
      'Las cadenas de rodillos estándar ANSI se identifican por su número, que indica el paso, es decir, la distancia entre los centros de dos rodillos.',
    sections: [
      {
        heading: 'Paso de la cadena',
        body: [
          'En la norma ANSI, la cadena 40 tiene paso de 1/2", la 50 de 5/8", la 60 de 3/4" y la 80 de 1". Cadena y piñón deben tener el mismo paso.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cómo sé qué número de cadena necesito?',
        a: 'Mide la distancia entre los centros de dos rodillos seguidos. Por ejemplo, 1/2" corresponde a una cadena ANSI 40 y 5/8" a una ANSI 50. El número suele estar grabado en las placas laterales.',
      },
    ],
  },
}
