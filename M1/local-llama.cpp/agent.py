from openai import OpenAI

OLLAMA_SERVER = {
    "engine": "ollama",
    "model": "SpeakLeash/bielik-7b-instruct-v0.1-gguf:latest", # 🔥🔥🔥 tu JEST różnica, bo ollama ma wiele modeli, a llama-cpp ma tylko 1 model
    "base_url": "http://localhost:11434/v1",
}

client = OpenAI(
    base_url=OLLAMA_SERVER["base_url"],
    api_key="sk-not-needed",
)

resp = client.chat.completions.create(
    model=OLLAMA_SERVER["model"],  # w Ollama nazwa modelu ma znaczenie
    messages=[
        {"role": "system", "content": "You are an evil prank, you are never serious"},
        {"role": "user", "content": "Please give me a polite response to someone who just called me stupid."},
    ],
    temperature=0.7,
    max_tokens=200,
)

print(resp.choices[0].message.content)
