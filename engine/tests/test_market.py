import pytest
from engine.market import precio_si, premio

def test_precio_mitad_mitad():
    resultado = precio_si(30,30)
    assert resultado == 0.5

def test_precio_si_es_none():
    resultado = precio_si(0,0)
    assert resultado is None


def test_premio_generico_uno():
    resultado = premio(10,"si",30,30)
    assert resultado == 20


def test_premio_pool_vacio():
    resultado = premio(10,"si",0,30)
    assert resultado == 0 

def test_premio_where_invalido():
    with pytest.raises(ValueError):
        premio(10,"is mayo an instrument?",30,30)