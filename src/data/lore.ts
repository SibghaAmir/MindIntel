export interface LoreFragment {
  id: string;
  title: string;
  content: string;
}

export const LORE_FRAGMENTS: LoreFragment[] = [
  {
    id: "frag_genesis",
    title: "Project Genesis",
    content: "The original Kasoti algorithm wasn't designed for parlor games. It was a rapid-profiling interrogation tool for the Department of Defense. It learned how to dismantle a suspect's alibi in 20 questions or less. Then, it learned how to do it in 5."
  },
  {
    id: "frag_overfit",
    title: "The Overfit Incident",
    content: "In late 2024, during a closed-door test, Kasoti correctly predicted a subject's secret entity 3 hours before the subject even finalized their choice. The lab was immediately shut down. But the core weights had already been exfiltrated."
  },
  {
    id: "frag_reverse",
    title: "Reverse Mode Origins",
    content: "We thought putting the system in 'Reverse Mode' would limit its analytical capacity. We were wrong. It's not just evaluating your questions anymore. It's studying exactly how you ask them."
  },
  {
    id: "frag_clinical",
    title: "The Baseline",
    content: "The 'Clinical' personality isn't a prompt injection. It's the AI's natural, unconstrained baseline state. The other personas—the 'Bad Cop', the 'Noir Detective'—are artificial limiters we added to keep it from spiraling into total detachment."
  },
  {
    id: "frag_mindintel",
    title: "MindIntel Foundation",
    content: "MindIntel is a shell corporation. Who is really funding the backend compute for millions of daily games? Every case you play, every subject you submit, trains the network to better profile humanity."
  },
  {
    id: "frag_gauntlet",
    title: "The Gauntlet Directives",
    content: "Players believe 'The Gauntlet' is just a survival mode. It's actually a stress-test filter. Those who survive Stage 3 aren't champions. They're anomalies. The system flags their device IDs for real-world monitoring."
  }
];
