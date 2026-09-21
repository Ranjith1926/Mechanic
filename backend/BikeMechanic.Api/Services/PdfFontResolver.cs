using PdfSharp.Fonts;

namespace BikeMechanic.Api.Services;

public class PdfFontResolver : IFontResolver
{
    private const string FamilyName = "Invoice Sans";

    private static readonly string FontsDirectory = Environment.GetFolderPath(Environment.SpecialFolder.Fonts);

    public string DefaultFontName => FamilyName;

    public byte[] GetFont(string faceName)
    {
        var fileName = faceName switch
        {
            "InvoiceSans#b" => "segoeuib.ttf",
            _ => "segoeui.ttf"
        };

        var path = Path.Combine(FontsDirectory, fileName);
        if (File.Exists(path))
        {
            return File.ReadAllBytes(path);
        }

        var fallback = faceName == "InvoiceSans#b" ? "arialbd.ttf" : "arial.ttf";
        return File.ReadAllBytes(Path.Combine(FontsDirectory, fallback));
    }

    public FontResolverInfo? ResolveTypeface(string familyName, bool isBold, bool isItalic)
    {
        if (!familyName.Equals(FamilyName, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return new FontResolverInfo(isBold ? "InvoiceSans#b" : "InvoiceSans");
    }
}
