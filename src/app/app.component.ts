import { Component } from "@angular/core";
import { NgtCanvas } from "angular-three";
import { SceneGraph } from "./experience/scene";
import { Experience } from "./experience/experience.component";
import { Overlay } from "./overlay";

@Component({
	selector: "app-root",
	standalone: true,
	template: `
		<ngt-canvas 
			[sceneGraph]="scene"
            [shadows]="true"
            [camera]=" { position: [0, 0, 5], fov: 30 }"
		/>
		<app-overlay></app-overlay>
	`,
	
	imports: [NgtCanvas, Overlay],
	host:{class: 'block h-screen w-screen'}
})
export class AppComponent {
	scene = SceneGraph;
    escena = Experience;
}
