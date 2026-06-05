import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

//denna fil hanterar både modell för kursobjekt samt hämtande av JSON-fil mned kursdata

//interface för kursobjekt
export interface CourseModel {
  courseCode: string,
  subjectCode: string,
  level: string,
  courseName: string,
  points: number,
  institutionCode: string,
  subject: string,
  syllabus?: string
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  //testat att ladda ner json-data och använda direkt i filen
  private url = "assets/miun_courses.json";

  constructor(
    private http: HttpClient
  ){}

  getCourses(): Observable<CourseModel[]>{
    return this.http.get<CourseModel[]>(this.url);
  }
}
