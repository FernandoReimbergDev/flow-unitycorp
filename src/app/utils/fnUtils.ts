export function isValidBadge(input: string): boolean {
    const regex = /^\d{3}[^a-zA-Z0-9\s]{1}\d{3}$/;
    return regex.test(input);
}


export const frasesMotivacionais = [
    "Cada peça produzida carrega o orgulho do nosso trabalho bem-feito.",
    "Trabalhar com dedicação transforma esforço em excelência.",
    "Não é sobre fazer mais rápido, é sobre fazer com qualidade.",
    "Juntos, transformamos matéria-prima em conquistas.",
    "Seu esforço hoje é o resultado que entregamos amanhã.",
    "A perfeição não está no resultado, está na atenção aos detalhes.",
    "Disciplina é fazer o certo mesmo quando ninguém está olhando.",
    "Seja a engrenagem que move a equipe para frente.",
    "Grandes resultados vêm de pequenas ações feitas com excelência.",
    "O que nos diferencia é o capricho em cada etapa do processo.",
    "Uma equipe unida é capaz de superar qualquer meta.",
    "Quem trabalha com vontade constrói com propósito.",
    "Cada dia é uma nova chance de fazer melhor.",
    "Sua dedicação é o que transforma desafios em soluções.",
    "A produção é forte quando cada um dá o seu melhor.",
    "A meta é importante, mas o caminho é construído em equipe.",
    "Trabalho duro não é castigo, é ponte para o sucesso.",
    "O tempo investido com atenção é o que gera qualidade.",
    "A excelência começa na primeira atitude do dia.",
    "Orgulhe-se do que você ajuda a construir.",
    "Comprometimento é a base de todo resultado duradouro.",
    "Cada segundo de foco evita horas de retrabalho.",
    "Mais do que produzir, aqui nós criamos valor.",
    "Seu talento faz parte de algo muito maior.",
    "A força da equipe está no empenho de cada um.",
    "Produzir com paixão é deixar uma marca em tudo que fazemos.",
    "Na produção, cada tarefa conta — e cada pessoa importa.",
    "Com união, disciplina e vontade, não há linha que pare.",
    "Mais do que bater meta, é sobre superar a si mesmo.",
    "Se você acredita no que faz, o resultado sempre surpreende."
];

