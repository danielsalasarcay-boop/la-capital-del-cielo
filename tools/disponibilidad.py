"""Genera data/disponibilidad.json a partir de los Excel de cada casa.

Lee la pestaña "Booking" (calendario de 12 meses, una columna de nombre por mes)
y guarda solo los rangos ocupados, sin nombres de huéspedes.

Uso:
  python3 tools/disponibilidad.py casa-9="Ing vs Egre 2026 Casa 9.xlsx" \
      casa-verde="Gastos CasaVerde  año 2026.xlsx" casa-panza="Gastos Casa Panza  año 2026.xlsx"

Regla: el calendario marca también el día de salida, así que una estadía
marcada del 16 al 18 ocupa las noches del 16 y del 17, y el 18 queda libre
para que entre otro huésped. Una marca de un solo día bloquea esa noche.
"""
import datetime
import json
import sys
from pathlib import Path

import openpyxl

ANIO = 2026
SALIDA = Path(__file__).resolve().parent.parent / 'data' / 'disponibilidad.json'


def rangos(xlsx):
    ws = openpyxl.load_workbook(xlsx, data_only=True)['Booking']
    dias = {}
    for fila in ws.iter_rows(min_row=3, max_row=33, values_only=True):
        for m in range(12):
            d = fila[3 * m] if 3 * m < len(fila) else None
            nombre = fila[3 * m + 2] if 3 * m + 2 < len(fila) else None
            if isinstance(d, (int, float)) and isinstance(nombre, str) and nombre.strip():
                dias[datetime.date(ANIO, m + 1, int(d))] = nombre.strip()
    bloques, actual = [], None
    for dia in sorted(dias):
        if actual and actual[0] == dias[dia] and (dia - actual[2]).days == 1:
            actual[2] = dia
        else:
            actual = [dias[dia], dia, dia]
            bloques.append(actual)
    salida = []
    for _, ini, fin in bloques:
        if fin == ini:
            fin = ini + datetime.timedelta(days=1)
        salida.append([ini.isoformat(), fin.isoformat()])
    return salida


def main(args):
    casas = {}
    for arg in args:
        casa_id, archivo = arg.split('=', 1)
        casas[casa_id] = {'ocupado': rangos(archivo)}
    datos = {
        'actualizado': datetime.date.today().isoformat(),
        'nota': 'Rangos [entrada, salida): la noche de salida queda libre. Generado con tools/disponibilidad.py',
        'casas': casas,
    }
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    for casa_id, c in casas.items():
        print(casa_id, len(c['ocupado']), 'rangos ocupados')


if __name__ == '__main__':
    main(sys.argv[1:])
