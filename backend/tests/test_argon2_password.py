import pytest
import security
from passlib.hash import bcrypt


def test_argon2id_password_hashing():
    """Valida se novas senhas são hasheadas utilizando Argon2id."""
    password = "MinhaSenhaSuperSegura123!"
    hashed = security.get_password_hash(password)

    # Verifica se o hash gerado é explicitamente Argon2id
    assert hashed.startswith("$argon2id$")
    assert "$m=65536,t=3,p=4$" in hashed

    # Validação de senha correta
    assert security.verify_password(password, hashed) is True

    # Validação de senha incorreta
    assert security.verify_password("SenhaErrada123!", hashed) is False

    # Não deve precisar de rehash pois já é Argon2id
    assert security.needs_rehash(hashed) is False


def test_argon2id_backward_compatibility_with_bcrypt():
    """Valida se hashes legados em Bcrypt continuam sendo validados e sinalizam needs_rehash."""
    password = "SenhaLegada123!"
    legacy_bcrypt_hash = bcrypt.hash(password)

    # Verifica se o hash legado é bcrypt
    assert legacy_bcrypt_hash.startswith(("$2b$", "$2a$"))

    # Deve validar com sucesso a senha em bcrypt
    assert security.verify_password(password, legacy_bcrypt_hash) is True
    assert security.verify_password("SenhaIncorreta", legacy_bcrypt_hash) is False

    # Deve identificar que precisa de rehash para atualizar para Argon2id
    assert security.needs_rehash(legacy_bcrypt_hash) is True
