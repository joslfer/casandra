

# función que determina las probabilidades de que entre 


def precio_si(si, no):
    total = si+no
    if total == 0:
        return None
    probabilidad = si / (no + si)
    return probabilidad


def premio_si(stake, pool_si, pool_no):
    total_pool = pool_si + pool_no 
    if pool_si == 0: return 0 
    premio  = total_pool *( stake / pool_si )
    return premio


def premio_no(stake, pool_si, pool_no):
    total_pool = pool_si + pool_no 
    if pool_no == 0: return 0
    premio  = total_pool *(stake / pool_no )
    return premio



def premio(stake, where, pool_si, pool_no):
    total_pool = pool_si + pool_no 
    if where == "si":
        if pool_si == 0:
            return 0
        premio  = total_pool *( stake / pool_si )
    elif where == "no":
        if pool_no == 0: 
            return 0
        premio  = total_pool *( stake / pool_no )
    else:
        raise ValueError("Qué estás apostando? Solo admite si / no")
    return premio



class Mercado:
    def __init__(self,pool_si,pool_no):
        self.pool_si = pool_si
        self.pool_no = pool_no
        self.apuestas = {}

    def apostar(self,nombre, cantidad, lado):
        if lado == "si":
            self.pool_si += cantidad
        elif lado == "no":
            self.pool_no += cantidad
        else:
            raise ValueError("Lado inválido")

        if nombre not in self.apuestas:
            self.apuestas[nombre] = {"si":0, "no":0}
        
        self.apuestas[nombre][lado] += cantidad

    def retirar(self,nombre,cantidad,lado):
        if nombre not in self.apuestas:
            raise ValueError("Esta persona no ha apostado")

        if lado not in ("si","no"):
            raise ValueError("Lado inválido")

        if cantidad > self.apuestas[nombre][lado]:
            raise ValueError("No tienes tanto para retirar")
        
        self.apuestas[nombre][lado] -= cantidad

        if lado == "si":
            self.pool_si -= cantidad
        elif lado == "no":
            self.pool_no -= cantidad

        return cantidad

    def resolver(self,resultado):
        if resultado not in ("si","no"):
            raise ValueError("Resultado Inválido")

        pagos = {}
        for nombre, apuesta, in self.apuestas.items():
            stake = apuesta[resultado]
            pagos[nombre] = premio(stake, resultado, self.pool_si, self.pool_no)
        return pagos