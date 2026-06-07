import { Component, signal, computed, effect } from '@angular/core';

//importerar service från course. Där finns också interface för kurser 
import { DataService, CourseModel } from "../services/data-service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { CoursesService } from "../services/courses-service"

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
})

export class CoursesComponent {
  //kurser sparas i array-minne
  courses = signal<CourseModel[]>([]);

  searchPhrase = signal<string>("");

  //för sortering av kolumner. Utgår initialt från första kolumnen "code", a-ö. 
  sortCourses = signal<keyof CourseModel>("courseCode");

  //sortering: grundläga = true, mao stigande (A-Ö)
  sortAsc= signal<boolean>(true);

  //hade problem med att se tabell. Använde denna nedan för att se om ngt ändrades
  loading= signal<boolean>(true);

  //meddelande för att lägga till kurs
  /*Hade inte signal för dessa innan. Fungerade ok, men hanterade meddelandena konstigt(försvann inte).
  Testade signal. Fungerade utan problem.*/
  message = signal("");
  isSuccess = signal(true);

  //pagination
  //första sidan är alltid 1
  //visa 15 kurser/sida
  currentPage = signal(1);
  itemsPerPage = 15;

  //signal för att ändra vilket ämne man tittar på från select
  selectedSubject = signal<string>("Alla kurser");

  //===COMPUTED/UTRÄKNINGAR===
  paginatedCourses = computed(() => {
    const start = (this.currentPage() -1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return this.filteredCourses().slice(start,end);
  })

  subjects = computed(() => {
    //går igenom alla kurser, plockat ut alla subject delar
    //t.ex. { subject: "Datateknik"} => "Datateknik"
    const all = this.courses().map(c => c.subject);
    //new Set: tar bort dubbletter
    //... = spread operator. Används för att "packa ihop" igen.
    //innan: ["datateknik", "matematik", "datateknik"]
    //set städar igenom, tar bort dubbletter
    //... framför gör det till en vanlig lista igen: ["datateknik", "matematik"] men utan dubletter
    return ["Alla kurser", ...new Set(all)];
  })

  //uträkning för att kunna visa hur många kurser som finns i ramschemat
  scheduleCount = computed(() => 
    this.coursesService.savedCourses().length);

  //uträkning som visar hur många kurser som sökts efter
  courseCount = computed(() => 
    this.filteredCourses().length);

  //===CONSTRUCTOR = Bygg på en gång===
  constructor(
    private dataService: DataService,
    private coursesService: CoursesService){

    //subscribe = "prenumeration" som lyssnar efter förändringar över tid
    //förändringar fångas upp som data
    //sparas i array courses (se högst upp i denna komponent export)
    //gör laddning till falskt när det är klart: ny data har kommit in och visas, behöver inte laddas
    this.dataService.getCourses().subscribe(data => {
      this.courses.set(data);
      this.loading.set(false);
    });

    //använd effect för att övervaka förändringar. 
    //nollställ automatiskt när något på sidan förändras (byter ämne, skriver sökfras)
    effect(() => {
      this.selectedSubject();
      this.searchPhrase();
      this.currentPage.set(1);
    })
  }

  //===METODER===
  //metod som ska räkna ut automatiskt:
  filteredCourses = computed(() => {
    let result = this.courses();
    //om valda ämne att sortera efter inte är alla, filtera efter valt ämne
    if(this.selectedSubject() !=="Alla kurser"){
      result = result.filter(c => 
        c.subject === this.selectedSubject()
      )
    }
    //SÖKFILTER
    const phrase = this.searchPhrase().toLowerCase().trim();

    //om sökning gjorts: visa resultat efter filtrering
    if(phrase){
      result = result.filter(c =>
        c.courseCode.toLowerCase().includes(phrase) ||
        c.courseName.toLowerCase().includes(phrase) || 
        c.level.toLowerCase().includes(phrase) ||
        c.subject.toLowerCase().includes(phrase)
      );
    }
    //SORTERING
    const key = this.sortCourses();
    const asc = this.sortAsc();

    //returnera resultat: sortera
    //skapa ny array utan att röra gamla (result)
    //sortera, men kontrollera först om det är poäng (siffror)
    return [...result].sort((a,b) => {
      if(key === "points"){
        const aNum = Number(a.points);
        const bNum = Number(b.points);
        return asc ? aNum - bNum : bNum - aNum;
      }
      
      const aValue = String(a[key]).toLowerCase();
      const bValue = String(b[key]).toLowerCase();

      if (aValue < bValue) return asc ? -1 : 1;
      if (aValue > bValue) return asc ? 1 : -1;
      return 0;
    });
  });

  //uppdatera searchPhrases signal så den har det nya värdet
  //t.ex. användaren söker på "javascript". Nytt värde är javascript
  setSearch(value: string){
    this.searchPhrase.set(value);
  }

  //sortera tabell efter den kolumn användaren klickade på
  sortBy(field: keyof CourseModel) {

    if (this.sortCourses() === field) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortCourses.set(field);
      this.sortAsc.set(true);
    }
  }


  //lägg till kurser till localstorage
  addToSchedule(course: CourseModel){
    //hämta sparade kurser: är en array
    const added = this.coursesService.addCourse(course);

    if(!added){
      this.showMessage("Kursen finns redan i schemat!", false);
      return;
    }
    this.showMessage("Kurs tillagd!", true);
  }
  //visa meddelande om kurs finns tillagd/blir tillagd
  showMessage(text: string, success:boolean){
    this.message.set(text);
    this.isSuccess.set(success);
    console.log("SET:", this.message);

    //ta bort meddelande efter ett tag
    setTimeout(() => {
      this.message.set("");
    }, 3000);
  }


  //pagination: visa fler sidor
  //update: ta vilken sida det är just nu, + 1 när man går till nästa. Annars -1 om nuvarande sida är mer än 1
  nextPage(){
    this.currentPage.update(page => page + 1);
  }
  prevPage(){
    if(this.currentPage() > 1){
      this.currentPage.update(page => page - 1);
    }
  }
}