{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 8,
            "minor": 6,
            "revision": 0,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [140.0, 140.0, 980.0, 570.0],
        "bglocked": 0,
        "openinpresentation": 0,
        "default_fontsize": 12.0,
        "default_fontface": 0,
        "default_fontname": "Arial",
        "gridonopen": 1,
        "gridsize": [15.0, 15.0],
        "gridsnaponopen": 1,
        "objectsnaponopen": 1,
        "statusbarvisible": 2,
        "toolbarvisible": 1,
        "description": "Fresh-instance runner for the Layer A to Layer B real-video smoke test",
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer A -> Layer B Real Video Smoke Runner Wrapper",
                    "patching_rect": [30.0, 25.0, 410.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "bpatcher",
                    "name": "sfs.layer_ab.video_file_smoke.maxpat",
                    "numinlets": 0,
                    "numoutlets": 0,
                    "patching_rect": [30.0, 60.0, 920.0, 480.0]
                }
            }
        ],
        "lines": []
    }
}
