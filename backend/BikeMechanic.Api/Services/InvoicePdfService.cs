using BikeMechanic.Api.Entities;
using PdfSharp.Drawing;
using PdfSharp.Pdf;

namespace BikeMechanic.Api.Services;

public interface IInvoicePdfService
{
    byte[] Generate(Invoice invoice);
}

public class InvoicePdfService : IInvoicePdfService
{
    public byte[] Generate(Invoice invoice)
    {
        using var document = new PdfDocument();
        var page = document.AddPage();
        page.Size = PdfSharp.PageSize.A4;
        var gfx = XGraphics.FromPdfPage(page);

        var titleFont = new XFont("Invoice Sans", 18, XFontStyleEx.Bold);
        var headingFont = new XFont("Invoice Sans", 11, XFontStyleEx.Bold);
        var normalFont = new XFont("Invoice Sans", 10, XFontStyleEx.Regular);
        var smallFont = new XFont("Invoice Sans", 9, XFontStyleEx.Regular);

        double margin = 40;
        double width = page.Width.Point - 2 * margin;
        double y = margin;

        gfx.DrawString("INVOICE", titleFont, XBrushes.Black, new XPoint(margin, y + 20));
        gfx.DrawString(invoice.InvoiceNumber, headingFont, XBrushes.Black, new XRect(margin, y, width, 20), XStringFormats.TopRight);
        gfx.DrawString(invoice.InvoiceDate.ToString("dd-MMM-yyyy"), normalFont, XBrushes.Black, new XRect(margin, y + 20, width, 20), XStringFormats.TopRight);

        if (invoice.IsVoided)
        {
            gfx.DrawString("VOID", new XFont("Invoice Sans", 28, XFontStyleEx.Bold), XBrushes.Red, new XRect(margin, y + 45, width, 30), XStringFormats.TopRight);
        }

        y += 55;
        gfx.DrawLine(XPens.LightGray, margin, y, margin + width, y);
        y += 15;

        gfx.DrawString("Bill To", headingFont, XBrushes.Black, new XPoint(margin, y));
        y += 16;
        gfx.DrawString(invoice.Client.Name, normalFont, XBrushes.Black, new XPoint(margin, y));
        y += 14;
        gfx.DrawString(invoice.Client.Phone, normalFont, XBrushes.Black, new XPoint(margin, y));

        var vehicleY = y - 30;
        gfx.DrawString("Vehicle", headingFont, XBrushes.Black, new XRect(margin, vehicleY, width, 16), XStringFormats.TopRight);
        gfx.DrawString($"{invoice.Bike.Brand} {invoice.Bike.Model}", normalFont, XBrushes.Black, new XRect(margin, vehicleY + 16, width, 14), XStringFormats.TopRight);
        gfx.DrawString(invoice.Bike.RegistrationNumber, normalFont, XBrushes.Black, new XRect(margin, vehicleY + 30, width, 14), XStringFormats.TopRight);

        y += 30;
        gfx.DrawLine(XPens.LightGray, margin, y, margin + width, y);
        y += 20;

        double colDesc = margin;
        double colQty = margin + width - 220;
        double colPrice = margin + width - 150;
        double colAmount = margin + width - 70;

        gfx.DrawString("Description", headingFont, XBrushes.Black, new XPoint(colDesc, y));
        gfx.DrawString("Qty", headingFont, XBrushes.Black, new XPoint(colQty, y));
        gfx.DrawString("Unit Price", headingFont, XBrushes.Black, new XPoint(colPrice, y));
        gfx.DrawString("Amount", headingFont, XBrushes.Black, new XPoint(colAmount, y));
        y += 8;
        gfx.DrawLine(XPens.Black, margin, y, margin + width, y);
        y += 14;

        string? currentCategory = null;
        foreach (var item in invoice.InvoiceItems.OrderBy(i => i.Category).ThenBy(i => i.Id))
        {
            if (item.Category.ToString() != currentCategory)
            {
                currentCategory = item.Category.ToString();
                gfx.DrawString(FormatCategory(currentCategory), smallFont, XBrushes.Gray, new XPoint(colDesc, y));
                y += 14;
            }

            gfx.DrawString(item.Description, normalFont, XBrushes.Black, new XPoint(colDesc + 10, y));
            gfx.DrawString(item.Quantity.ToString(), normalFont, XBrushes.Black, new XPoint(colQty, y));
            gfx.DrawString($"Rs. {item.UnitPrice:N2}", normalFont, XBrushes.Black, new XPoint(colPrice, y));
            gfx.DrawString($"Rs. {item.Amount:N2}", normalFont, XBrushes.Black, new XPoint(colAmount, y));
            y += 16;
        }

        y += 10;
        gfx.DrawLine(XPens.LightGray, margin, y, margin + width, y);
        y += 16;

        DrawTotalRow(gfx, "Labour", invoice.LabourAmount, normalFont, margin, colAmount, width, ref y);
        DrawTotalRow(gfx, "Spare Parts", invoice.SparePartsAmount, normalFont, margin, colAmount, width, ref y);
        if (invoice.Discount > 0)
        {
            DrawTotalRow(gfx, "Discount", -invoice.Discount, normalFont, margin, colAmount, width, ref y);
        }
        if (invoice.Tax > 0)
        {
            DrawTotalRow(gfx, "Tax", invoice.Tax, normalFont, margin, colAmount, width, ref y);
        }

        y += 4;
        gfx.DrawLine(XPens.Black, margin, y, margin + width, y);
        y += 4;
        DrawTotalRow(gfx, "Total", invoice.TotalAmount, headingFont, margin, colAmount, width, ref y);

        if (!string.IsNullOrWhiteSpace(invoice.Notes))
        {
            y += 20;
            gfx.DrawString("Notes", headingFont, XBrushes.Black, new XPoint(margin, y));
            y += 14;
            gfx.DrawString(invoice.Notes, normalFont, XBrushes.Black, new XRect(margin, y, width, 60), XStringFormats.TopLeft);
        }

        gfx.DrawString("Thank you for choosing our service.", smallFont, XBrushes.Gray, new XRect(margin, page.Height.Point - margin - 20, width, 20), XStringFormats.BottomCenter);

        using var stream = new MemoryStream();
        document.Save(stream, false);
        return stream.ToArray();
    }

    private static void DrawTotalRow(XGraphics gfx, string label, decimal amount, XFont font, double margin, double colAmount, double width, ref double y)
    {
        gfx.DrawString(label, font, XBrushes.Black, new XPoint(colAmount - 100, y));
        gfx.DrawString($"Rs. {amount:N2}", font, XBrushes.Black, new XPoint(colAmount, y));
        y += 18;
    }

    private static string FormatCategory(string category) => category switch
    {
        "Labour" => "Labour",
        "SparePart" => "Spare Parts",
        _ => "Other"
    };
}
