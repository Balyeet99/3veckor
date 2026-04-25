import pytest
from unittest.mock import MagicMock, patch
from src.controllers.usercontroller import UserController


@pytest.fixture
def user_controller():
    mock_dao = MagicMock()
    return UserController(dao=mock_dao)


def test_invalid_email_no_at(user_controller):
    with pytest.raises(ValueError):
        user_controller.get_user_by_email("bademail")


def test_invalid_email_no_dot(user_controller):
    with pytest.raises(ValueError):
        user_controller.get_user_by_email("user@test")


def test_no_user_returns_none(user_controller):
    user_controller.dao.find.return_value = []

    result = user_controller.get_user_by_email("user@test.com")

    assert result is None


def test_one_user_returns_user(user_controller):
    user = {"email": "user@test.com", "name": "A"}
    user_controller.dao.find.return_value = [user]

    result = user_controller.get_user_by_email("user@test.com")

    assert result == user
    user_controller.dao.find.assert_called_once_with({"email": "user@test.com"})


def test_many_users_returns_first(user_controller, capsys):
    user1 = {"email": "user@test.com"}
    user2 = {"email": "user@test.com"}
    user_controller.dao.find.return_value = [user1, user2]

    result = user_controller.get_user_by_email("user@test.com")
    captured = capsys.readouterr()

    assert result == user1
    assert "user@test.com" in captured.out


def test_database_error(user_controller):
    user_controller.dao.find.side_effect = Exception("db error")

    with pytest.raises(Exception):
        user_controller.get_user_by_email("user@test.com")

def test_update_returns_result(user_controller):
    data = {"name": "Alex"}
    expected = {"modified_count": 1}

    with patch("src.controllers.controller.Controller.update", return_value=expected) as mock_update:
        result = user_controller.update("123", data)

    assert result == expected
    mock_update.assert_called_once_with(id="123", data={"$set": data})


def test_update_raises_exception(user_controller):
    with patch("src.controllers.controller.Controller.update", side_effect=Exception("update error")):
        with pytest.raises(Exception, match="update error"):
            user_controller.update("123", {"name": "Alex"})