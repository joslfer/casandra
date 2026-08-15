

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
