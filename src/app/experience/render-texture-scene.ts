import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	input,
} from "@angular/core";
import { NgtArgs, pick } from "angular-three";
import { NgtsPerspectiveCamera } from "angular-three-soba/cameras";
import { NgtsOrbitControls } from "angular-three-soba/controls";
import { injectGLTF } from "angular-three-soba/loaders";
import {
	NgtsAccumulativeShadows,
	NgtsEnvironment,
	NgtsLightformer,
	NgtsRandomizedLights,
} from "angular-three-soba/staging";
import { BackSide, MathUtils, Mesh } from "three";
import { ShowroomScene } from "../state";

injectGLTF.preload(() => [
	"models/cybertruck_scene.glb",
	"models/model3_scene.glb",
	"models/semi_scene.glb",
]);

const ratioScale = Math.min(1.2, Math.max(0.5, window.innerWidth / 1920));

@Component({
	selector: "app-render-texture-scene",
	standalone: true,
	template: `
		<!-- <ngt-color *args="['#ffffff']" attach="background" /> -->
		<ngt-group [name]="name()" [dispose]="null">
			
			<ngts-perspective-camera 
				[options]="{ makeDefault: true, position: [3, 3, 8], near: 0.5 }"
			/>

			<ngts-orbit-controls
				[options]="{
					autoRotate: true,
					enablePan: false,
					maxPolarAngle: DEG2RAD * 75,
					minDistance: 6,
					maxDistance: 10,
					autoRotateSpeed: 0.5,
				}"
			/>

			<ngt-primitive *args="[model()]" [parameters]="{ scale: ratioScale }" />

			<ngt-ambient-light [intensity]="0.1 * Math.PI" color="pink" />
			
		</ngt-group>
	`,

	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		NgtArgs,
		NgtsPerspectiveCamera,
		NgtsOrbitControls,
	],
})
export class RenderTextureScene {
	Math = Math;
	DEG2RAD = MathUtils.DEG2RAD;
	BackSide = BackSide;
	ratioScale = ratioScale;

	scene = input.required<ShowroomScene>();
	name = pick(this.scene, "name");

	private gltf = injectGLTF(() => this.scene().path);
	model = computed(() => {
		const gltf = this.gltf();
		if (!gltf) return null;
		const model = gltf.scene;
		model.traverse((child) => {
			if ((child as Mesh).isMesh) {
				child.castShadow =  child.receiveShadow = true;
			}
		});
		return model;
	});
}
