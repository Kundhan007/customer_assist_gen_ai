export class RagResultDto {
  text_chunk!: string;
  metadata?: any;
  similarity!: number;
}

export class RagResponseDto {
  results: any[] = [];
  totalResults: number = 0;
  query: string = '';
}
