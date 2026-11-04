// Generated from docs/design/prism/tokens.json by scripts/design_tokens.py. Do not edit.
// A specification for the Apple app (MP-62): the app's colour assets and constants are made from this file.
import SwiftUI

public enum Prism {
  public enum Palette {
    public static let ground = Color(light: Color(red: 0.9569, green: 0.9647, blue: 0.9843), dark: Color(red: 0.0235, green: 0.0392, blue: 0.0941))
    public static let ground2 = Color(light: Color(red: 0.9294, green: 0.9412, blue: 0.9686), dark: Color(red: 0.0392, green: 0.0627, blue: 0.1412))
    public static let surface = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000), dark: Color(red: 0.0549, green: 0.0784, blue: 0.1647))
    public static let surface2 = Color(light: Color(red: 0.9333, green: 0.9451, blue: 0.9725), dark: Color(red: 0.0902, green: 0.1216, blue: 0.2392))
    public static let surface3 = Color(light: Color(red: 0.9098, green: 0.9255, blue: 0.9608), dark: Color(red: 0.1176, green: 0.1529, blue: 0.2824))
    public static let thumb = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000), dark: Color(red: 0.1686, green: 0.2118, blue: 0.3922))
    public static let ink = Color(light: Color(red: 0.0784, green: 0.0902, blue: 0.1216), dark: Color(red: 0.9529, green: 0.9608, blue: 0.9725))
    public static let ink2 = Color(light: Color(red: 0.3059, green: 0.3294, blue: 0.3843), dark: Color(red: 0.7725, green: 0.8000, blue: 0.8431))
    public static let inkInv = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000), dark: Color(red: 0.0431, green: 0.0549, blue: 0.0784))
    public static let hairline = Color(light: Color(red: 0.8667, green: 0.8863, blue: 0.9333), dark: Color(red: 0.1490, green: 0.1882, blue: 0.3216))
    public static let hairline2 = Color(light: Color(red: 0.7765, green: 0.8039, blue: 0.8745), dark: Color(red: 0.2902, green: 0.3412, blue: 0.5333))
    public static let glass = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000, opacity: 0.72), dark: Color(red: 0.0706, green: 0.0941, blue: 0.2118, opacity: 0.72))
    public static let glassThick = Color(light: Color(red: 0.9804, green: 0.9843, blue: 1.0000, opacity: 0.86), dark: Color(red: 0.0784, green: 0.1059, blue: 0.2275, opacity: 0.84))
    public static let glassThin = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000, opacity: 0.5), dark: Color(red: 0.0863, green: 0.1176, blue: 0.2510, opacity: 0.46))
    public static let glassEdge = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000, opacity: 0.85), dark: Color(red: 1.0000, green: 1.0000, blue: 1.0000, opacity: 0.12))
    public static let glassLine = Color(light: Color(red: 0.0392, green: 0.0588, blue: 0.1412, opacity: 0.1), dark: Color(red: 0.0000, green: 0.0000, blue: 0.0000, opacity: 0.35))
    public static let scrim = Color(light: Color(red: 0.0392, green: 0.0588, blue: 0.1412, opacity: 0.3), dark: Color(red: 0.0000, green: 0.0000, blue: 0.0000, opacity: 0.52))
    public static let rise = Color(light: Color(red: 0.0275, green: 0.4118, blue: 0.2431), dark: Color(red: 0.3882, green: 0.8902, blue: 0.6275))
    public static let riseTint = Color(light: Color(red: 0.8863, green: 0.9529, blue: 0.9176), dark: Color(red: 0.0627, green: 0.1608, blue: 0.1216))
    public static let fall = Color(light: Color(red: 0.7020, green: 0.1294, blue: 0.2275), dark: Color(red: 1.0000, green: 0.6902, blue: 0.7216))
    public static let fallTint = Color(light: Color(red: 0.9843, green: 0.9020, blue: 0.9137), dark: Color(red: 0.1725, green: 0.0784, blue: 0.1255))
    public static let warn = Color(light: Color(red: 0.5608, green: 0.2392, blue: 0.0314), dark: Color(red: 1.0000, green: 0.7216, blue: 0.5216))
    public static let warnTint = Color(light: Color(red: 0.9882, green: 0.9216, blue: 0.8667), dark: Color(red: 0.1725, green: 0.1098, blue: 0.0627))
    public static let link = Color(light: Color(red: 0.1647, green: 0.2980, blue: 0.8471), dark: Color(red: 0.6863, green: 0.7569, blue: 1.0000))
    public static let focus = Color(light: Color(red: 0.1647, green: 0.2980, blue: 0.8471), dark: Color(red: 0.6863, green: 0.7569, blue: 1.0000))
    public static let fcInk = Color(light: Color(red: 0.4941, green: 0.3216, blue: 0.0000), dark: Color(red: 1.0000, green: 0.7608, blue: 0.3020))
    public static let fcLine = Color(light: Color(red: 0.4784, green: 0.3059, blue: 0.0000), dark: Color(red: 1.0000, green: 0.8627, blue: 0.5882))
    public static let fc80 = Color(light: Color(red: 0.9608, green: 0.6471, blue: 0.1412, opacity: 0.57), dark: Color(red: 1.0000, green: 0.7608, blue: 0.3020, opacity: 0.36))
    public static let fc50 = Color(light: Color(red: 0.7686, green: 0.4235, blue: 0.0000, opacity: 0.48), dark: Color(red: 1.0000, green: 0.7608, blue: 0.3020, opacity: 0.32))
    public static let fcTint = Color(light: Color(red: 1.0000, green: 0.9529, blue: 0.8627), dark: Color(red: 0.1686, green: 0.1294, blue: 0.0627))
    public static let scored = Color(light: Color(red: 0.0549, green: 0.6235, blue: 0.4196), dark: Color(red: 0.2392, green: 0.8627, blue: 0.5922))
    public static let scoredInk = Color(light: Color(red: 0.0275, green: 0.4118, blue: 0.2431), dark: Color(red: 0.2392, green: 0.8627, blue: 0.5922))
    public static let history = Color(light: Color(red: 0.3059, green: 0.3294, blue: 0.3843), dark: Color(red: 0.7725, green: 0.8000, blue: 0.8431))
    public static let btn = Color(light: Color(red: 0.0784, green: 0.0902, blue: 0.1216), dark: Color(red: 0.9529, green: 0.9608, blue: 0.9725))
    public static let btnInk = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000), dark: Color(red: 0.0431, green: 0.0549, blue: 0.0784))
    public static let segUslarge = Color(light: Color(red: 0.1843, green: 0.3294, blue: 0.9216), dark: Color(red: 0.1843, green: 0.3294, blue: 0.9216))
    public static let segUstech = Color(light: Color(red: 0.4157, green: 0.2471, blue: 0.9020), dark: Color(red: 0.4157, green: 0.2471, blue: 0.9020))
    public static let segUsetf = Color(light: Color(red: 0.0431, green: 0.4353, blue: 0.7882), dark: Color(red: 0.0431, green: 0.4353, blue: 0.7882))
    public static let segN50 = Color(light: Color(red: 0.7569, green: 0.1216, blue: 0.4745), dark: Color(red: 0.7569, green: 0.1216, blue: 0.4745))
    public static let segMidcap = Color(light: Color(red: 0.5686, green: 0.1922, blue: 0.7490), dark: Color(red: 0.5686, green: 0.1922, blue: 0.7490))
    public static let segInetf = Color(light: Color(red: 0.6627, green: 0.2824, blue: 0.1216), dark: Color(red: 0.6627, green: 0.2824, blue: 0.1216))
    public static let segUketf = Color(light: Color(red: 0.0000, green: 0.4863, blue: 0.5333), dark: Color(red: 0.0000, green: 0.4863, blue: 0.5333))
    public static let segMetals = Color(light: Color(red: 0.3333, green: 0.3804, blue: 0.4706), dark: Color(red: 0.3333, green: 0.3804, blue: 0.4706))
    public static let onSeg = Color(light: Color(red: 1.0000, green: 1.0000, blue: 1.0000), dark: Color(red: 1.0000, green: 1.0000, blue: 1.0000))
    public static let markUs = Color(light: Color(red: 0.1843, green: 0.3294, blue: 0.9216), dark: Color(red: 0.1843, green: 0.3294, blue: 0.9216))
    public static let markUk = Color(light: Color(red: 0.0000, green: 0.6275, blue: 0.6588), dark: Color(red: 0.0000, green: 0.6275, blue: 0.6588))
    public static let markIn = Color(light: Color(red: 0.7098, green: 0.1569, blue: 0.4941), dark: Color(red: 0.7098, green: 0.1569, blue: 0.4941))
  }

  public enum Metric {
    public static let rXs: CGFloat = 8
    public static let rSm: CGFloat = 12
    public static let rMd: CGFloat = 14
    public static let rCard: CGFloat = 22
    public static let rTile: CGFloat = 24
    public static let rSheet: CGFloat = 30
    public static let sp4: CGFloat = 4
    public static let sp8: CGFloat = 8
    public static let sp12: CGFloat = 12
    public static let sp16: CGFloat = 16
    public static let sp20: CGFloat = 20
    public static let sp24: CGFloat = 24
    public static let sp32: CGFloat = 32
    public static let sp48: CGFloat = 48
    public static let tap: CGFloat = 44
    public static let btnH: CGFloat = 50
    public static let blur: CGFloat = 22
    public static let tabH: CGFloat = 84
    public static let sideW: CGFloat = 248
    public static let ipadSideW: CGFloat = 280
    public static let moFast: CGFloat = 0.18
    public static let moBase: CGFloat = 0.34
    public static let moSlow: CGFloat = 0.52
    public static let moDraw: CGFloat = 0.95
    public static let moCount: CGFloat = 0.75
    public static let moStep: CGFloat = 0.045
  }

  public enum Curve {
    public static let moSmooth = Animation.timingCurve(0.22, 1, 0.36, 1)
    public static let moSnappy = Animation.timingCurve(0.3, 1.25, 0.5, 1)
    public static let moBouncy = Animation.timingCurve(0.3, 1.18, 0.5, 1)
    public static let moSheet = Animation.timingCurve(0.32, 0.72, 0, 1)
  }
}

extension Color {
  /// A colour that follows the system appearance; the app's asset catalog carries the same pair.
  init(light: Color, dark: Color) {
    self.init(uiColor: UIColor { $0.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light) })
  }
}
