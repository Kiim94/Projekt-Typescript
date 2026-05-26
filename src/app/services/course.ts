import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


//interface för kursobjekt
export interface Course {
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
export class CourseService {
  //testat att ladda ner json-data och använda direkt i filen
  private url = "assets/miun_courses.json";

  constructor(
    private http: HttpClient
  ){}

  getCourses(): Observable<Course[]>{
    return this.http.get<Course[]>(this.url);
  }
}
