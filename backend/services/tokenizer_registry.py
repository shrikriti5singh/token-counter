from transformers import AutoTokenizer

_tokenizers = {}

def get_tokenizer(model_name: str):
    try:
        if model_name not in _tokenizers:
            _tokenizers[model_name] = AutoTokenizer.from_pretrained(model_name, use_fast=True)

        return _tokenizers[model_name]
    except Exception as e:
        return None
