import {
    ChangeDetectionStrategy, 
    Component, 
    CUSTOM_ELEMENTS_SCHEMA, 
    ElementRef, 
    viewChild} from "@angular/core";
import { extend, NgtArgs, injectStore, injectBeforeRender } from "angular-three";
import { NgtsGrid } from "angular-three-soba/abstractions";
import { NgtsOrbitControls } from "angular-three-soba/controls";
import { 
    NgtsEnvironment,
	NgtsRenderTexture,
	NgtsRenderTextureContent,
} from "angular-three-soba/staging";
import * as THREE from "three";
import { Mesh } from "three";
import { activeSlide, scenes } from "../state";
import { RenderTextureScene } from "./render-texture-scene";
import { CameraHandler } from "./camera-handler";

extend(THREE);

@Component({
    standalone: true,
    template: `
        <!-- Background color de la escena-->
        <ngt-color *args="['#ececec']" attach="background" />
        <!-- Ambient light de la escena-->
        <ngt-ambient-light [intensity]="0.2 * Math.PI" />
        <!-- Entorno de la escena-->
        <ngts-environment [options]="{ preset: 'city'}" />
        
        <!-- Control de la camara para ir a las otras slides-->
        <app-camera-handler [slideDistance]="slideDistance"/>

        <ngt-group>
            <!-- Posiciona la camara en la parte superior del viewport, depende del fov, siempre comienza fuera de camara -->
            <!-- [position]= (x, y, z) -->
            <ngt-mesh #torus [position]="[0, viewport().height / 2 + 1.5, 0]" >
                <!-- Genera una dona, args es el tamaño del circulo interior de la dona -->
                <ngt-torus-geometry *args="[0.75]" />
                <!-- Desde el archivo state.ts se importa y se utiliza el color del primero en el objeto-->
                <ngt-mesh-standard-material [color]="scenes[0].mainColor" />
            </ngt-mesh>
        </ngt-group>

        <ngt-group>
            <!-- Posiciona la camara en la parte superior del viewport, depende del fov, siempre comienza fuera de camara -->
            <!-- viewport().width + slideDistance, es la distancia del eje x mas 1, distanciando hacia la derecha-->
            <ngt-mesh #box [position]="[viewport().width + slideDistance, viewport().height / 2 + 1.5, 0]" >
                <!-- Genera un cubo -->
                <ngt-box-geometry />
                <!-- Desde el archivo state.ts se importa y se utiliza el color del primero en el objeto-->
                <ngt-mesh-standard-material [color]="scenes[1].mainColor" />
            </ngt-mesh>
        </ngt-group>

        <ngt-group>
            <!-- Posiciona la camara en la parte superior del viewport, depende del fov, siempre comienza fuera de camara -->
            <!-- (viewport().width + slideDistance)* 2, es la distancia del eje x mas 1 por el doble, distanciando hacia la derecha al final-->
            <ngt-mesh #dodecahedron [position]="[(viewport().width + slideDistance)* 2, viewport().height / 2 + 1.5, 0]" >
                <!-- Genera dodecahedron -->
                <ngt-dodecahedron-geometry />
                <!-- Desde el archivo state.ts se importa y se utiliza el color del primero en el objeto-->
                <ngt-mesh-standard-material [color]="scenes[2].mainColor" />
            </ngt-mesh>
        </ngt-group>

        <!-- Grid infinito en la escena-->
        <ngts-grid
			[options]="{
				position: [0, -viewport().height / 2, 0],
				sectionSize: 1,
				sectionColor: 'purple',
				sectionThickness: 1,
				cellSize: 0.5,
				cellColor: '#6f6f6f',
				cellThickness: 0.6,
				infiniteGrid: true,
				fadeDistance: 50,
				fadeStrength: 5,
			}"
		/>
        
        @for (scene of scenes; track scene.name) {
            <!-- Posiciona todo el objeto en este caso el plano en el viewport -->
            <ngt-mesh [position]="[$index * (viewport().width + slideDistance), 0, 0]"> 
            <!-- Genera el plano a utilizar-->
                <ngt-plane-geometry  *args="[ viewport().width, viewport().height]"/>
                <!-- Le quita el color al plano -->
                <ngt-mesh-basic-material [toneMapped]="false"]>
                    <ngts-render-texture>
                        <app-render-texture-scene *renderTextureContent [scene]="scene"/>
                    </ngts-render-texture>
                </ngt-mesh-basic-material>
            </ngt-mesh>
        }

        <!-- Caja de la escena-->
        <!-- <ngt-mesh> 
            <ngt-box-geometry />
            <ngt-mesh-standard-material />
        </ngt-mesh> -->
        <!-- Orbit controls (control de camara) de la escena-->
        <!-- <ngts-orbit-controls /> -->
    `,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgtsOrbitControls,
    NgtArgs,
    NgtsEnvironment,
    NgtsGrid,
    NgtsRenderTexture,
    NgtsRenderTextureContent,
    RenderTextureScene,
    CameraHandler
]
})

export class SceneGraph {
    protected readonly Math = Math;
    // Escenas de la aplicacion, proviene del archivo state.ts donde se tienen configuraciones en un objeto
    protected readonly scenes = scenes;
    // Distancia de desplazamiento de la escena
    protected readonly slideDistance = 1;

    private store = injectStore();
    // Viewport de la escena, es responsivo al tamaño de la pantalla por ser un signal
    protected viewport = this.store.select("viewport")

    private torus = viewChild.required<ElementRef<Mesh>>("torus");
    private box = viewChild.required<ElementRef<Mesh>>("box");
    private dodecahedron = viewChild.required<ElementRef<Mesh>>("dodecahedron");

    constructor(){
        // Permite participar en el loop de animacion utilizando el callback
        injectBeforeRender(() => {
            const [ torus, box, dodecahedron ] = [ this.torus().nativeElement, this.box().nativeElement, this.dodecahedron().nativeElement ];
            // Rotacion de los objetos en la escena
            // y Es de izquierda a derecha, x es de arriba a bajo, z es de 
            torus.rotation.y += 0.005;
            box.rotation.y += 0.005;
            dodecahedron.rotation.y += 0.005;
        })
    }
}