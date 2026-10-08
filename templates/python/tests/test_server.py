import pytest
from harness import connect
from pydantic import AnyUrl

pytestmark = pytest.mark.anyio


async def test_lists_add_tool():
    async with connect() as client:
        result = await client.list_tools()
    assert "add" in [tool.name for tool in result.tools]


async def test_adds_two_numbers():
    async with connect() as client:
        result = await client.call_tool("add", {"a": 2, "b": 3})
    assert not result.isError
    assert result.content[0].text == "5"


async def test_rejects_arguments_that_do_not_match_the_schema():
    async with connect() as client:
        result = await client.call_tool("add", {"a": "x", "b": 1})
    assert result.isError


async def test_serves_the_greeting_resource():
    async with connect() as client:
        result = await client.read_resource(AnyUrl("greeting://hello"))
    assert result.contents[0].text == "hello"


async def test_renders_the_summarize_prompt():
    async with connect() as client:
        result = await client.get_prompt("summarize", {"topic": "tides"})
    assert result.messages[0].content.text == "Summarize tides."
