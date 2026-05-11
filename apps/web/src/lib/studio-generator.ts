// Studio Generator Types and Interfaces

export interface MindMapNode {
  id: string;
  text: string;
  children?: MindMapNode[];
}

export interface MindMap {
  root: MindMapNode;
}

export interface LearningGuide {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface PPTData {
  title: string;
  slides: {
    title: string;
    bulletPoints: string[];
  }[];
}

export interface IStudioGenerator {
  generateLearningGuide(notebookId: string, topic: string): Promise<LearningGuide>;
  generateMindMap(notebookId: string, topic: string): Promise<MindMap>;
  generatePPT(notebookId: string, topic: string): Promise<PPTData>;
}
