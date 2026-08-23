# Girls Math

Educação financeira prática, com estética sofisticada e experiência
personalizada. Nativo Android (Flutter), pensado para mulheres jovens que
querem entender o próprio dinheiro sem julgamento e sem jargão técnico.

## Visão do produto

"Girl Math" nasceu como piada — a lógica torta que transforma qualquer
compra em economia. Este app pega esse ponto de entrada familiar e o
transforma em uma ferramenta real de consciência financeira: cada gasto
registrado é traduzido em impacto (o que ele custa em relação às metas da
usuária), não apenas arquivado como número.

Princípios que guiam todas as decisões de produto:

- **Sem julgamento.** O app nunca diz "você gastou muito". Ele mostra o
  que um gasto significa perto do que a própria usuária definiu como
  importante.
- **Mínimo esforço manual.** Sugestão automática de categoria, poucos
  campos obrigatórios, tudo pensado para caber em 10 segundos entre uma
  tarefa e outra.
- **Linguagem viva.** Nenhuma mensagem é fixa. O motor de mensagens
  (`lib/services/message_engine.dart`) sorteia entre variações por tom de
  voz e contexto, para que o app nunca soe robótico ou repetitivo. Não há
  emojis em nenhum texto do produto.
- **Personalização real.** Categorias, metas, tom de comunicação (direto,
  leve, motivador) e alertas são configuráveis pela usuária desde o
  primeiro uso.

## Como o app resolve o que os concorrentes não resolvem

| Problema comum em apps financeiros | Abordagem do Girls Math |
| --- | --- |
| Interface fria, genérica | Paleta rosa sofisticada, hierarquia visual clara, sem poluição |
| Linguagem técnica e distante | Mensagens adaptativas, sem jargão, sem emoji |
| Zero personalização emocional | Tom de voz escolhido pela usuária, insights contextuais |
| Alto esforço manual → abandono | Registro em poucos toques, sugestão automática de categoria |

## Arquitetura

Arquitetura em camadas, sem dependência de servidor no MVP (dados locais):

```
lib/
  core/            Tema visual, utilitários (moeda, ícones)
  data/
    models/        Entidades: Expense, Goal, ExpenseCategory, UserProfile
    local/         SQLite (sqflite) — fonte da verdade offline
    repositories/  Acesso a dados, isolado da camada de UI
  services/
    category_suggestion_service.dart   Sugestão de categoria por palavra-chave
    message_engine.dart                Geração de linguagem adaptativa
    insight_engine.dart                Interpretação de gastos e metas
  state/           AppState (ChangeNotifier) — orquestra dados e regras
  screens/         Onboarding, painel principal, metas, padrões, ajustes
  widgets/         Componentes reutilizáveis de UI
```

Por que essa separação: a lógica de "o que dizer para a usuária" e "o que
os dados significam" vive em `services/`, independente de Flutter/UI — o
que permite testá-la isoladamente (ver `test/insight_engine_test.dart`) e
evoluir a inteligência do app sem tocar em tela nenhuma.

## Stack

- **Flutter** — Android primeiro, com caminho direto para iOS.
- **sqflite** — persistência local, performance offline, sem custo.
- **shared_preferences** — preferências leves (perfil, tom de voz).
- **provider** — gerenciamento de estado simples e previsível.
- **fl_chart** — visualização de gastos por categoria.

Nenhuma dependência paga. Firebase (Auth/Firestore/Analytics) pode ser
adicionado depois, sem mudança estrutural, para sincronização entre
dispositivos — o MVP funciona 100% offline.

## Rodando o projeto

```bash
cd girls_math
flutter pub get
flutter run
```

Testes:

```bash
flutter test
```

## Roadmap técnico

- Sincronização multi-dispositivo (Firebase Auth + Firestore) mantendo o
  SQLite local como cache offline-first.
- Integração com Open Finance para importação automática de transações,
  reduzindo ainda mais o esforço manual de registro.
- Sistema de recomendação mais avançado (categorização automática por
  padrão de texto, não apenas palavras-chave).
- Expansão para iOS a partir da mesma base Flutter.
- Monetização via camada premium (metas ilimitadas, insights avançados),
  sem depender de anúncios.

## Métrica de sucesso

Não é número de downloads. É a proporção de usuárias que, meses depois de
instalar o app, tomam decisões financeiras diferentes — e melhores — do
que tomariam sem ele.
