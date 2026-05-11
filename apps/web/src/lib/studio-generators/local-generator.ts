import { IStudioGenerator, LearningGuide, MindMap, MindMapNode, PPTData } from "../studio-generator";
import api from "../api-client";

export class LocalStudioGenerator implements IStudioGenerator {
  async generateLearningGuide(notebookId: string, topic: string): Promise<LearningGuide> {
    const response = await api.post<LearningGuide>("/research/studio/learning-guide", {
      notebook_id: notebookId,
      topic,
    });
    return response.data;
  }

  async generateMindMap(notebookId: string, topic: string): Promise<MindMap> {
    const response = await api.post<MindMap>("/research/studio/mindmap", {
      notebook_id: notebookId,
      topic,
    });
    return response.data;
  }

  async generatePPT(notebookId: string, topic: string): Promise<PPTData> {
    const response = await api.post<PPTData>("/research/studio/ppt", {
      notebook_id: notebookId,
      topic,
    });
    return response.data;
  }
}

export const studioGenerator = new LocalStudioGenerator();
