╔════════════════════════════════════════════════════════════════════════════╗
║                 ZON vs TOON vs CSV vs JSON BENCHMARK                       ║
║                   Token Efficiency Comparison                              ║
║                   Using GPT-5 o200k_base,Claude 3.5 (Anthropic),           ║
║                   Llama 3 (Meta) tokenizer                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
📊 Unified Dataset
   Combined dataset with tabular, nested, and time-series data
────────────────────────────────────────────────────────────────────────────────
📦 BYTE SIZES:
  ZON:              1,389 bytes
  TOON:             1,665 bytes
  CSV:              1,384 bytes
  YAML:             2,033 bytes
  XML:              3,235 bytes
  JSON (formatted): 2,842 bytes
  JSON (compact):   1,854 bytes

🔹 Tokenizer: GPT-4o (o200k)
  ZON          ██████████░░░░░░░░░░ 522 tokens 👑
               ├─ vs JSON formatted:  -44.4%
               ├─ vs JSON compact:    -11.4%
               ├─ vs TOON:            -15.0%
               ├─ vs CSV:             -2.2%
               ├─ vs YAML:            -28.3%
               └─ vs XML:             -52.2%

  TOON         ███████████░░░░░░░░░ 614 tokens 
               vs ZON: +17.6%

  CSV          ██████████░░░░░░░░░░ 534 tokens 
               vs ZON: +2.3%

  YAML         █████████████░░░░░░░ 728 tokens 
               vs ZON: +39.5%

  XML          ████████████████████ 1,093 tokens 
               vs ZON: +109.4%

  JSON (cmp)   ███████████░░░░░░░░░ 589 tokens 


🔹 Tokenizer: Claude 3.5 (Anthropic)
  ZON          ██████████░░░░░░░░░░ 545 tokens 
               ├─ vs JSON formatted:  -40.3%
               ├─ vs JSON compact:    -8.6%
               ├─ vs TOON:            -4.4%
               ├─ vs CSV:             +0.2%
               ├─ vs YAML:            -15.0%
               └─ vs XML:             -50.6%

  TOON         ██████████░░░░░░░░░░ 570 tokens 
               vs ZON: +4.6%

  CSV          ██████████░░░░░░░░░░ 544 tokens 👑
               vs ZON: -0.2%

  YAML         ████████████░░░░░░░░ 641 tokens 
               vs ZON: +17.6%

  XML          ████████████████████ 1,104 tokens 
               vs ZON: +102.6%

  JSON (cmp)   ███████████░░░░░░░░░ 596 tokens 


🔹 Tokenizer: Llama 3 (Meta)
  ZON          ██████████░░░░░░░░░░ 701 tokens 👑
               ├─ vs JSON formatted:  -42.7%
               ├─ vs JSON compact:    -7.8%
               ├─ vs TOON:            -10.6%
               ├─ vs CSV:             -3.7%
               ├─ vs YAML:            -21.6%
               └─ vs XML:             -49.6%

  TOON         ███████████░░░░░░░░░ 784 tokens 
               vs ZON: +11.8%

  CSV          ██████████░░░░░░░░░░ 728 tokens 
               vs ZON: +3.9%

  YAML         █████████████░░░░░░░ 894 tokens 
               vs ZON: +27.5%

  XML          ████████████████████ 1,392 tokens 
               vs ZON: +98.6%

  JSON (cmp)   ███████████░░░░░░░░░ 760 tokens 


════════════════════════════════════════════════════════════════════════════════
📊 Large Complex Nested Dataset
   Deeply nested, non-uniform structure with mixed types
────────────────────────────────────────────────────────────────────────────────
📦 BYTE SIZES:
  ZON:              341,654 bytes
  TOON:             607,194 bytes
  CSV:              369,682 bytes
  YAML:             607,189 bytes
  XML:              1,016,540 bytes
  JSON (formatted): 834,132 bytes
  JSON (compact):   551,854 bytes

🔹 Tokenizer: GPT-4o (o200k)
  ZON          █████████░░░░░░░░░░░ 146,745 tokens 👑
               ├─ vs JSON formatted:  -48.4%
               ├─ vs JSON compact:    -22.2%
               ├─ vs TOON:            -34.8%
               ├─ vs CSV:             -11.0%
               ├─ vs YAML:            -34.8%
               └─ vs XML:             -56.2%

  TOON         █████████████░░░░░░░ 224,940 tokens 
               vs ZON: +53.3%

  CSV          ██████████░░░░░░░░░░ 164,919 tokens 
               vs ZON: +12.4%

  YAML         █████████████░░░░░░░ 224,938 tokens 
               vs ZON: +53.3%

  XML          ████████████████████ 335,239 tokens 
               vs ZON: +128.5%

  JSON (cmp)   ███████████░░░░░░░░░ 188,604 tokens 


🔹 Tokenizer: Claude 3.5 (Anthropic)
  ZON          █████████░░░░░░░░░░░ 148,736 tokens 👑
               ├─ vs JSON formatted:  -45.7%
               ├─ vs JSON compact:    -19.7%
               ├─ vs TOON:            -24.5%
               ├─ vs CSV:             -8.0%
               ├─ vs YAML:            -24.5%
               └─ vs XML:             -54.6%

  TOON         ████████████░░░░░░░░ 196,893 tokens 
               vs ZON: +32.4%

  CSV          ██████████░░░░░░░░░░ 161,701 tokens 
               vs ZON: +8.7%

  YAML         ████████████░░░░░░░░ 196,892 tokens 
               vs ZON: +32.4%

  XML          ████████████████████ 327,274 tokens 
               vs ZON: +120.0%

  JSON (cmp)   ███████████░░░░░░░░░ 185,136 tokens 


🔹 Tokenizer: Llama 3 (Meta)
  ZON          ██████████░░░░░░░░░░ 233,922 tokens 👑
               ├─ vs JSON formatted:  -42.3%
               ├─ vs JSON compact:    -15.4%
               ├─ vs TOON:            -25.7%
               ├─ vs CSV:             -8.0%
               ├─ vs YAML:            -25.7%
               └─ vs XML:             -51.3%

  TOON         █████████████░░░░░░░ 314,824 tokens 
               vs ZON: +34.6%

  CSV          ███████████░░░░░░░░░ 254,181 tokens 
               vs ZON: +8.7%

  YAML         █████████████░░░░░░░ 314,820 tokens 
               vs ZON: +34.6%

  XML          ████████████████████ 480,125 tokens 
               vs ZON: +105.3%

  JSON (cmp)   ████████████░░░░░░░░ 276,405 tokens 


════════════════════════════════════════════════════════════════════════════════
📈 OVERALL SUMMARY
════════════════════════════════════════════════════════════════════════════════

🔹 GPT-4o (o200k) Summary:
  ZON Wins: 2/2 datasets
  Total Tokens:
  ZON: █████████████░░░░░░░░░░░░░░░░░ 147,267 tokens
       vs JSON (cmp): -22.2%
       vs TOON:       -34.7%
       vs CSV:        -11.0%
       vs YAML:       -34.7%
       vs XML:        -56.2%

🔹 Claude 3.5 (Anthropic) Summary:
  ZON Wins: 1/2 datasets
  Total Tokens:
  ZON: ██████████████░░░░░░░░░░░░░░░░ 149,281 tokens
       vs JSON (cmp): -19.6%
       vs TOON:       -24.4%
       vs CSV:        -8.0%
       vs YAML:       -24.4%
       vs XML:        -54.5%

🔹 Llama 3 (Meta) Summary:
  ZON Wins: 2/2 datasets
  Total Tokens:
  ZON: ███████████████░░░░░░░░░░░░░░░ 234,623 tokens
       vs JSON (cmp): -15.3%
       vs TOON:       -25.7%
       vs CSV:        -8.0%
       vs YAML:       -25.7%
       vs XML:        -51.3%

════════════════════════════════════════════════════════════════════════════════
✨ Benchmark complete!
════════════════════════════════════════════════════════════════════════════════

