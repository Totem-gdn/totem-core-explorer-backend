import { Observable } from 'rxjs';

export interface CreatePublisherRequest {
  name: string;
  webhookUrl: string;
}

export interface CreatePublisherResponse {
  apiKey: string;
}

export interface Publishers {
  Create(request: CreatePublisherRequest): Observable<CreatePublisherResponse>;
}
